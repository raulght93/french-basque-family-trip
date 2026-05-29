import { useEffect, useRef, useState } from "react";
import { API_BASE, TRIP_KEY } from "../data/team.js";

// Single hook that keeps local state in sync with the shared cloud bucket
// (worker.js, /api/state). It coordinates four sub-streams:
//
//   • votes      — per-member, merged server-side. Pushes my own votes only;
//                  on pull, others' votes overwrite local mirrors.
//   • comments   — per-(activity, member), one comment each. Pushes only my
//                  own per-activity comments; on pull, others' overwrite.
//   • shared     — { baseId, itinerary } with last-write-wins. Each field
//                  carries an `updatedAt` on the server; on pull we adopt
//                  the remote value UNLESS our own local edit is more recent
//                  (we recently fired a POST that hasn't echoed back yet).
//   • presence   — bumped every GET (`?me=mX`) and every POST. Read-only locally.
//
// Also pulls `log` (recent activity ring buffer) into local state for display.

const POLL_MS = 60_000;
const POST_DEBOUNCE_MS = 500;
const POST_LOCK_MS = 3_000;

const url = (path) => `${API_BASE}${path}`;
const stateUrl = (me) =>
  url(`/api/state?trip=${TRIP_KEY}${me ? `&me=${encodeURIComponent(me)}` : ""}`);

const post = async (body) => {
  const res = await fetch(url(`/api/state?trip=${TRIP_KEY}`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

// Convert local `votes` ({actId: [memberIds]}) ↔ remote `byMember` ({memberId: [actIds]})
const toByMember = (votes) => {
  const out = {};
  for (const [actId, voters] of Object.entries(votes || {})) {
    for (const m of voters || []) (out[m] = out[m] || []).push(actId);
  }
  return out;
};
const fromByMember = (byMember) => {
  const out = {};
  for (const [m, acts] of Object.entries(byMember || {})) {
    for (const a of acts || []) {
      const list = (out[a] = out[a] || []);
      if (!list.includes(m)) list.push(m);
    }
  }
  return out;
};
// Replace each member's array with remote's — but keep `selfId`'s local intact.
const mergeVotes = (localVotes, remoteByMember, selfId) => {
  const next = toByMember(localVotes);
  for (const [m, acts] of Object.entries(remoteByMember || {})) {
    if (m === selfId) continue;
    next[m] = acts;
  }
  return fromByMember(next);
};
// Keep my comments intact on pull; adopt others'.
const mergeComments = (localComments, remoteComments, selfId) => {
  const next = {};
  // Start with remote (full snapshot of everyone else).
  for (const [actId, members] of Object.entries(remoteComments || {})) {
    next[actId] = { ...members };
    if (selfId && localComments?.[actId]?.[selfId]) {
      next[actId][selfId] = localComments[actId][selfId];
    } else if (selfId && next[actId][selfId] && !localComments?.[actId]?.[selfId]) {
      // Local explicitly removed mine — keep removed.
      // We can't differentiate "never set" vs "explicitly removed" from local
      // alone; prefer remote here since the most common case is "I haven't
      // commented yet". A subsequent POST will clear if needed.
    }
  }
  // Add purely-local activities (where remote has nothing yet).
  for (const [actId, members] of Object.entries(localComments || {})) {
    if (!next[actId]) next[actId] = { ...members };
    else if (selfId && members[selfId] && !next[actId][selfId]) next[actId][selfId] = members[selfId];
  }
  return next;
};

const myActivityIds = (votes, selfId) =>
  Object.entries(votes || {})
    .filter(([, voters]) => (voters || []).includes(selfId))
    .map(([actId]) => actId);

const myCommentSig = (comments, selfId) => {
  if (!selfId) return "{}";
  const out = {};
  for (const [actId, members] of Object.entries(comments || {})) {
    if (members?.[selfId]) out[actId] = members[selfId].text || "";
  }
  return JSON.stringify(out);
};

export const useTripSync = ({ state, enabled = true }) => {
  const {
    votes, setVotes,
    selfMemberId,
    comments, setComments,
    baseId, setBaseId,
    itinerary, setItinerary,
    setPresence, setRecentLog, setSharedMeta,
  } = state;

  const [status, setStatus] = useState("idle"); // idle | syncing | ok | error
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  // Refs to coordinate state across effects without dep-array gymnastics.
  const readyRef = useRef(false);
  const lockUntil = useRef({ votes: 0, baseId: 0, itinerary: 0, comments: 0 });
  const lastPostedVotes = useRef("");
  const lastPostedComments = useRef("{}");
  const lastPostedBaseId = useRef(undefined);
  const lastPostedItinerary = useRef(undefined);
  const setters = useRef({});
  setters.current = { setVotes, setComments, setBaseId, setItinerary, setPresence, setRecentLog, setSharedMeta };

  // ── GET helper ──
  const pullRemote = useRef(async () => {
    setStatus("syncing");
    try {
      const res = await fetch(stateUrl(selfMemberId || ""));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const s = setters.current;
      const now = Date.now();

      // Always-applied (we don't author these): presence, recentLog.
      s.setPresence(data.presence || {});
      s.setRecentLog(data.log || []);
      s.setSharedMeta({
        baseUpdatedBy: data.shared?.baseUpdatedBy ?? null,
        baseUpdatedAt: data.shared?.baseUpdatedAt ?? null,
        itineraryUpdatedBy: data.shared?.itineraryUpdatedBy ?? null,
        itineraryUpdatedAt: data.shared?.itineraryUpdatedAt ?? null,
      });

      // votes — always merge (self-preserving merge).
      if (now > lockUntil.current.votes) {
        s.setVotes((local) => mergeVotes(local, data.byMember || {}, selfMemberId));
      }

      // comments — merge keeping my own.
      if (now > lockUntil.current.comments) {
        s.setComments((local) => mergeComments(local, data.comments || {}, selfMemberId));
      }

      // shared.baseId — adopt only when remote has an opinion AND its
      // timestamp is newer than our last local change.
      const remoteBaseAt = data.shared?.baseUpdatedAt ? new Date(data.shared.baseUpdatedAt).getTime() : 0;
      if (remoteBaseAt && remoteBaseAt > lockUntil.current.baseId) {
        s.setBaseId(data.shared.baseId);
      }

      // shared.itinerary — same idea.
      const remoteItAt = data.shared?.itineraryUpdatedAt ? new Date(data.shared.itineraryUpdatedAt).getTime() : 0;
      if (remoteItAt && remoteItAt > lockUntil.current.itinerary) {
        s.setItinerary(data.shared.itinerary || {});
      }

      readyRef.current = true;
      setLastSyncedAt(new Date());
      setStatus("ok");
    } catch (e) {
      setStatus("error");
      if (typeof globalThis.console !== "undefined") globalThis.console.warn("sync (GET) failed:", e);
    }
  });

  // ── Initial GET + focus / interval polling ──
  useEffect(() => {
    if (!enabled) return undefined;
    pullRemote.current();
    const onFocus = () => pullRemote.current();
    const onVis = () => { if (globalThis.document?.visibilityState === "visible") pullRemote.current(); };
    globalThis.window?.addEventListener("focus", onFocus);
    globalThis.document?.addEventListener("visibilitychange", onVis);
    const id = globalThis.setInterval(() => pullRemote.current(), POLL_MS);
    return () => {
      globalThis.window?.removeEventListener("focus", onFocus);
      globalThis.document?.removeEventListener("visibilitychange", onVis);
      globalThis.clearInterval(id);
    };
  }, [enabled, selfMemberId]);

  // ── POST: votes (my activityIds) ──
  useEffect(() => {
    if (!enabled || !selfMemberId || !readyRef.current) return undefined;
    const ids = myActivityIds(votes, selfMemberId).sort();
    const payload = { kind: "votes", memberId: selfMemberId, activityIds: ids };
    const sig = JSON.stringify(payload);
    if (sig === lastPostedVotes.current) return undefined;
    const t = globalThis.setTimeout(async () => {
      lastPostedVotes.current = sig;
      lockUntil.current.votes = Date.now() + POST_LOCK_MS;
      try { setStatus("syncing"); await post(payload); setStatus("ok"); setLastSyncedAt(new Date()); }
      catch (e) { setStatus("error"); if (typeof globalThis.console !== "undefined") globalThis.console.warn("sync (POST votes) failed:", e); }
    }, POST_DEBOUNCE_MS);
    return () => globalThis.clearTimeout(t);
  }, [votes, selfMemberId, enabled]);

  // ── POST: baseId (last-write-wins) ──
  useEffect(() => {
    if (!enabled || !selfMemberId || !readyRef.current) return undefined;
    if (baseId === lastPostedBaseId.current) return undefined;
    const t = globalThis.setTimeout(async () => {
      lastPostedBaseId.current = baseId;
      lockUntil.current.baseId = Date.now() + POST_LOCK_MS;
      try {
        setStatus("syncing");
        const data = await post({ kind: "shared", memberId: selfMemberId, patch: { baseId } });
        // Sync sharedMeta optimistically with what the server stamped.
        setters.current.setSharedMeta((m) => ({
          ...m,
          baseUpdatedBy: data.shared?.baseUpdatedBy ?? m.baseUpdatedBy,
          baseUpdatedAt: data.shared?.baseUpdatedAt ?? m.baseUpdatedAt,
        }));
        setStatus("ok"); setLastSyncedAt(new Date());
      } catch (e) { setStatus("error"); if (typeof globalThis.console !== "undefined") globalThis.console.warn("sync (POST base) failed:", e); }
    }, POST_DEBOUNCE_MS);
    return () => globalThis.clearTimeout(t);
  }, [baseId, selfMemberId, enabled]);

  // ── POST: itinerary (last-write-wins) ──
  useEffect(() => {
    if (!enabled || !selfMemberId || !readyRef.current) return undefined;
    const sig = JSON.stringify(itinerary || {});
    if (sig === JSON.stringify(lastPostedItinerary.current || {})) return undefined;
    const t = globalThis.setTimeout(async () => {
      lastPostedItinerary.current = itinerary;
      lockUntil.current.itinerary = Date.now() + POST_LOCK_MS;
      try {
        setStatus("syncing");
        const data = await post({ kind: "shared", memberId: selfMemberId, patch: { itinerary } });
        setters.current.setSharedMeta((m) => ({
          ...m,
          itineraryUpdatedBy: data.shared?.itineraryUpdatedBy ?? m.itineraryUpdatedBy,
          itineraryUpdatedAt: data.shared?.itineraryUpdatedAt ?? m.itineraryUpdatedAt,
        }));
        setStatus("ok"); setLastSyncedAt(new Date());
      } catch (e) { setStatus("error"); if (typeof globalThis.console !== "undefined") globalThis.console.warn("sync (POST itinerary) failed:", e); }
    }, POST_DEBOUNCE_MS);
    return () => globalThis.clearTimeout(t);
  }, [itinerary, selfMemberId, enabled]);

  // ── POST: my comments (one POST per changed activity) ──
  useEffect(() => {
    if (!enabled || !selfMemberId || !readyRef.current) return undefined;
    const sig = myCommentSig(comments, selfMemberId);
    if (sig === lastPostedComments.current) return undefined;
    // Find which activity ids' "my" comment changed since last sig.
    const prevMap = JSON.parse(lastPostedComments.current || "{}");
    const curMap = JSON.parse(sig);
    const changed = new Set([...Object.keys(prevMap), ...Object.keys(curMap)])
      .values();
    const toPost = [];
    for (const actId of changed) if ((prevMap[actId] ?? "") !== (curMap[actId] ?? "")) toPost.push(actId);
    if (toPost.length === 0) { lastPostedComments.current = sig; return undefined; }
    const t = globalThis.setTimeout(async () => {
      lastPostedComments.current = sig;
      lockUntil.current.comments = Date.now() + POST_LOCK_MS;
      try {
        setStatus("syncing");
        for (const actId of toPost) {
          // eslint-disable-next-line no-await-in-loop
          await post({ kind: "comment", memberId: selfMemberId, activityId: actId, text: curMap[actId] || "" });
        }
        setStatus("ok"); setLastSyncedAt(new Date());
      } catch (e) { setStatus("error"); if (typeof globalThis.console !== "undefined") globalThis.console.warn("sync (POST comment) failed:", e); }
    }, POST_DEBOUNCE_MS);
    return () => globalThis.clearTimeout(t);
  }, [comments, selfMemberId, enabled]);

  return { status, lastSyncedAt };
};
