import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage, STORAGE_PREFIX, clearAllStorage } from "./useLocalStorage.js";
import { useShareableState } from "./useShareableState.js";
import { addDays } from "../utils/dates.js";
import { TEAM, memberName } from "../data/team.js";

// Single source of truth for the trip. The roster is fixed in `data/team.js`
// (everyone sees the same names) and each browser picks who *they* are via
// `selfMemberId` so their votes are attributed correctly when synced to the
// shared cloud bucket (see hooks/useTripSync.js).

const K = (name) => `${STORAGE_PREFIX}${name}`;

export const TRIP_NAME = "Viaje familiar País Vasco francés";

// Default: a week in August 2026 (the proposal's hours are August; the booking
// deadlines fall in July/August). 6 nights → 7 days.
const DEFAULT_START = "2026-08-08";
const DEFAULT_NIGHTS = 6;

const toDate = (iso) => new Date(`${iso}T00:00:00`);

export const useTripState = () => {
  const share = useShareableState();

  const [baseId, setBaseId] = useLocalStorage(K("baseId"), null);
  // Who am I? null until the user picks an identity on first visit.
  const [selfMemberId, setSelfMemberId] = useLocalStorage(K("self"), null);
  const [votes, setVotes] = useLocalStorage(K("votes"), {}); // { activityId: [memberId,...] }
  const [startDateISO, setStartDateISO] = useLocalStorage(K("startDate"), DEFAULT_START);
  const [nights, setNights] = useLocalStorage(K("nights"), DEFAULT_NIGHTS);
  const [cars, setCars] = useLocalStorage(K("cars"), 1);
  const [itinerary, setItinerary] = useLocalStorage(K("itinerary"), {});
  const [budgetOverrides, setBudgetOverrides] = useLocalStorage(K("budget"), {});

  // ── Cloud-backed state (cached in-memory only — KV is the source of truth) ──
  // `comments[activityId][memberId] = { text, ts }`
  const [comments, setComments] = useState({});
  // `presence[memberId] = ISO timestamp of last activity`
  const [presence, setPresence] = useState({});
  // Recent activity ring buffer (last ~50 events): `{ ts, memberId, kind, summary }`
  const [recentLog, setRecentLog] = useState([]);
  // Metadata on the SHARED fields (who/when last changed base or itinerary).
  const [sharedMeta, setSharedMeta] = useState({
    baseUpdatedBy: null,
    baseUpdatedAt: null,
    itineraryUpdatedBy: null,
    itineraryUpdatedAt: null,
  });

  // Members are the fixed family roster, not editable per-browser.
  const members = TEAM;
  const travelers = members.length;

  // Bootstrap from a shared URL exactly once (legacy share-by-URL still
  // supported but no longer carries members/activeMemberId — those are global).
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    const seed = share.readFromUrl();
    if (!seed) return;
    if (seed.baseId !== undefined) setBaseId(seed.baseId);
    if (seed.votes) setVotes(seed.votes);
    if (seed.startDateISO) setStartDateISO(seed.startDateISO);
    if (typeof seed.nights === "number") setNights(seed.nights);
    if (typeof seed.cars === "number") setCars(seed.cars);
    if (seed.itinerary) setItinerary(seed.itinerary);
    share.clearUrlParam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived dates ──
  const startDate = useMemo(() => toDate(startDateISO), [startDateISO]);
  const days = useMemo(
    () => Array.from({ length: nights + 1 }, (_, i) => addDays(startDate, i)),
    [startDate, nights],
  );
  const endDate = useMemo(() => addDays(startDate, nights), [startDate, nights]);

  // ── Votes ──
  const votersOf = (actId) => votes[actId] || [];
  const voteCount = (actId) => votersOf(actId).length;
  const hasVoted = (actId, memberId) => votersOf(actId).includes(memberId);
  // Toggle a vote for a SPECIFIC member id. The UI restricts who can vote
  // (only `selfMemberId`); this signature is kept generic for safety.
  const toggleVote = (actId, memberId) =>
    setVotes((prev) => {
      const list = prev[actId] || [];
      const next = list.includes(memberId)
        ? list.filter((x) => x !== memberId)
        : [...list, memberId];
      return { ...prev, [actId]: next };
    });
  // Convenience: vote toggle "as me" (used everywhere now that identity is locked).
  const toggleMyVote = (actId) => {
    if (!selfMemberId) return;
    toggleVote(actId, selfMemberId);
  };
  const isMyVote = (actId) => (selfMemberId ? hasVoted(actId, selfMemberId) : false);

  const isInterested = (actId) => voteCount(actId) > 0;

  // ── Comments ──
  const commentsForActivity = (actId) => {
    const obj = comments[actId] || {};
    return Object.entries(obj).map(([memberId, c]) => ({ memberId, ...c }));
  };
  const getMyComment = (actId) =>
    selfMemberId ? comments[actId]?.[selfMemberId] : undefined;
  const setMyComment = (actId, text) => {
    if (!selfMemberId) return;
    setComments((prev) => {
      const next = { ...prev };
      next[actId] = { ...(next[actId] || {}) };
      const trimmed = (text || "").trim();
      if (trimmed) {
        next[actId][selfMemberId] = { text: trimmed, ts: new Date().toISOString() };
      } else {
        delete next[actId][selfMemberId];
        if (Object.keys(next[actId]).length === 0) delete next[actId];
      }
      return next;
    });
  };

  // ── Itinerary (day index → ordered array of activity ids) ──
  const activitiesOnDay = (dayIdx) => itinerary[dayIdx] || [];
  const isScheduled = (actId) =>
    Object.values(itinerary).some((list) => list?.includes(actId));
  const dayOfActivity = (actId) => {
    const entry = Object.entries(itinerary).find(([, list]) => list?.includes(actId));
    return entry ? Number(entry[0]) : null;
  };
  const assignActivity = (dayIdx, actId) =>
    setItinerary((prev) => {
      const next = {};
      for (const [k, list] of Object.entries(prev)) next[k] = (list || []).filter((x) => x !== actId);
      next[dayIdx] = [...(next[dayIdx] || []), actId];
      return next;
    });
  const unassignActivity = (actId) =>
    setItinerary((prev) => {
      const next = {};
      for (const [k, list] of Object.entries(prev)) next[k] = (list || []).filter((x) => x !== actId);
      return next;
    });
  const insertActivity = (toDay, actId, index = null) =>
    setItinerary((prev) => {
      const next = {};
      for (const [k, list] of Object.entries(prev)) next[k] = (list || []).filter((x) => x !== actId);
      const target = [...(next[toDay] || [])];
      const at = index == null || index > target.length ? target.length : Math.max(0, index);
      target.splice(at, 0, actId);
      next[toDay] = target;
      return next;
    });
  const moveActivityInDay = (dayIdx, actId, dir) =>
    setItinerary((prev) => {
      const list = [...(prev[dayIdx] || [])];
      const i = list.indexOf(actId);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return prev;
      [list[i], list[j]] = [list[j], list[i]];
      return { ...prev, [dayIdx]: list };
    });

  // ── Quick profiles: load a ready-made plan (base + votes + itinerary). ──
  // Replaces current votes (using the current self as the voter for every
  // plan activity) and itinerary.
  const applyProfile = (profile) => {
    if (!profile) return;
    if (profile.base) setBaseId(profile.base);
    const ids = new Set();
    Object.values(profile.days || {}).forEach((list) => (list || []).forEach((id) => ids.add(id)));
    const voter = selfMemberId || members[0]?.id;
    const nv = {};
    if (voter) ids.forEach((id) => { nv[id] = [voter]; });
    setVotes(nv);
    setItinerary(profile.days || {});
  };

  // ── Budget overrides ──
  const setBudgetField = (key, value) =>
    setBudgetOverrides((prev) => ({ ...prev, [key]: value }));

  const setStartDate = (iso) => setStartDateISO(iso);

  // ── Saved indicator ──
  const [savedTick, setSavedTick] = useState(0);
  useEffect(() => {
    setSavedTick((t) => t + 1);
  }, [baseId, votes, startDateISO, nights, cars, itinerary, budgetOverrides, selfMemberId]);

  const buildShareUrl = () =>
    share.buildShareUrl({ baseId, votes, startDateISO, nights, cars, itinerary });

  const resetAll = () => {
    clearAllStorage();
    if (typeof globalThis.location !== "undefined") globalThis.location.reload();
  };

  return {
    tripName: TRIP_NAME,
    baseId, setBaseId,
    members, memberName: (id) => memberName(id),
    selfMemberId, setSelfMemberId,
    // Backwards-compat alias used by older callsites; equal to the self id.
    activeMemberId: selfMemberId,
    votes, setVotes, votersOf, voteCount, hasVoted, toggleVote, toggleMyVote, isMyVote, isInterested,
    // Comments (per-activity, per-member)
    comments, setComments, commentsForActivity, getMyComment, setMyComment,
    // Cloud-only state (read-only for components; sync hook writes)
    presence, setPresence,
    recentLog, setRecentLog,
    sharedMeta, setSharedMeta,
    startDate, startDateISO, setStartDate, endDate,
    nights, setNights, days,
    travelers, cars, setCars,
    itinerary, activitiesOnDay, isScheduled, dayOfActivity,
    assignActivity, unassignActivity, insertActivity, moveActivityInDay,
    applyProfile,
    budgetOverrides, setBudgetField,
    savedTick,
    buildShareUrl, resetAll,
  };
};
