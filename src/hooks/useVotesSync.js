import { useEffect, useRef, useState } from "react";
import { API_BASE, TRIP_KEY } from "../data/team.js";

// Auto-sync of votes with the shared Cloudflare KV bucket.
// - On mount: GET → merge remote (every member except me) into local votes.
// - On focus / 60s timer: re-GET to catch others' edits.
// - On local vote change for ME: debounced POST with my activity ids.
//
// The local votes shape is { activityId: [memberId,...] }; on the wire the
// remote shape is { byMember: { memberId: [activityId,...] } }. We translate
// between the two so the rest of the app keeps its simpler local model.

const POLL_MS = 60_000;
const POST_DEBOUNCE_MS = 600;

const url = (path) => `${API_BASE}${path}`;

const toByMember = (votes) => {
  const out = {};
  for (const [actId, voters] of Object.entries(votes || {})) {
    for (const m of voters || []) {
      (out[m] = out[m] || []).push(actId);
    }
  }
  return out;
};

const fromByMember = (byMember) => {
  const out = {};
  for (const [m, acts] of Object.entries(byMember || {})) {
    for (const actId of acts || []) {
      const list = out[actId] || (out[actId] = []);
      if (!list.includes(m)) list.push(m);
    }
  }
  return out;
};

// Merge remote into local, KEEPING local's own self votes untouched (the
// POST that just left may not be reflected yet on the server response from
// an earlier GET).
const mergeRemote = (localVotes, remoteByMember, selfId) => {
  const next = toByMember(localVotes);
  for (const [m, acts] of Object.entries(remoteByMember || {})) {
    if (m === selfId) continue;
    next[m] = acts;
  }
  return fromByMember(next);
};

// My current activity ids from the local `votes`.
const myActivityIds = (votes, selfId) =>
  Object.entries(votes || {})
    .filter(([, voters]) => (voters || []).includes(selfId))
    .map(([actId]) => actId);

export const useVotesSync = ({ votes, setVotes, selfMemberId, enabled = true }) => {
  // "idle" | "syncing" | "ok" | "error" — surfaced in the UI as a small chip.
  const [status, setStatus] = useState("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const lastPostedSig = useRef("");
  const setVotesRef = useRef(setVotes);
  setVotesRef.current = setVotes;

  // GET helper — applies remote into local (preserving own votes).
  const pullRemote = useRef(async (selfId) => {
    setStatus("syncing");
    try {
      const res = await fetch(url(`/api/votes?trip=${TRIP_KEY}`), { method: "GET" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const remote = data?.byMember ?? {};
      setVotesRef.current((local) => mergeRemote(local, remote, selfId));
      setLastSyncedAt(new Date());
      setStatus("ok");
    } catch (e) {
      setStatus("error");
      // eslint-disable-next-line no-console
      if (typeof globalThis.console !== "undefined") globalThis.console.warn("votes sync (GET) failed:", e);
    }
  });

  // ── Initial GET + focus/poll refresh ──
  useEffect(() => {
    if (!enabled) return undefined;
    pullRemote.current(selfMemberId);
    const onFocus = () => pullRemote.current(selfMemberId);
    const onVis = () => { if (globalThis.document?.visibilityState === "visible") pullRemote.current(selfMemberId); };
    globalThis.window?.addEventListener("focus", onFocus);
    globalThis.document?.addEventListener("visibilitychange", onVis);
    const id = globalThis.setInterval(() => pullRemote.current(selfMemberId), POLL_MS);
    return () => {
      globalThis.window?.removeEventListener("focus", onFocus);
      globalThis.document?.removeEventListener("visibilitychange", onVis);
      globalThis.clearInterval(id);
    };
  }, [enabled, selfMemberId]);

  // ── Debounced POST of my own vote changes ──
  useEffect(() => {
    if (!enabled || !selfMemberId) return undefined;
    const ids = myActivityIds(votes, selfMemberId).sort();
    const payload = { memberId: selfMemberId, activityIds: ids };
    const sig = JSON.stringify(payload);
    if (sig === lastPostedSig.current) return undefined;

    const t = globalThis.setTimeout(async () => {
      lastPostedSig.current = sig;
      setStatus("syncing");
      try {
        const res = await fetch(url(`/api/votes?trip=${TRIP_KEY}`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: sig,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setLastSyncedAt(new Date());
        setStatus("ok");
      } catch (e) {
        setStatus("error");
        // eslint-disable-next-line no-console
        if (typeof globalThis.console !== "undefined") globalThis.console.warn("votes sync (POST) failed:", e);
      }
    }, POST_DEBOUNCE_MS);
    return () => globalThis.clearTimeout(t);
  }, [votes, selfMemberId, enabled]);

  return { status, lastSyncedAt };
};
