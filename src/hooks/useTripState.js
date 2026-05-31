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

// Default: Wed 19 → Mon 25 August 2026 (6 nights, 7 days). Day 1 (Wed) is
// mostly the 7-hour drive from Ciudad Real; Day 7 (Mon) is the return.
// Friday 21 is the day of the Sare market (16:30–20:30 in August).
const DEFAULT_START = "2026-08-19";
const DEFAULT_NIGHTS = 6;

// Previous defaults that early users may still have cached in localStorage.
// We migrate them once on load to the current DEFAULT_START so the whole
// family ends up on the same dates even if they opened the app before the
// trip dates were finalised. Users who explicitly picked another date are
// left alone (their value isn't in this set).
const LEGACY_DEFAULT_START_DATES = new Set(["2026-08-08"]);

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
    budgetUpdatedBy: null,
    budgetUpdatedAt: null,
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
    if (seed) {
      if (seed.baseId !== undefined) setBaseId(seed.baseId);
      if (seed.votes) setVotes(seed.votes);
      if (seed.startDateISO) setStartDateISO(seed.startDateISO);
      if (typeof seed.nights === "number") setNights(seed.nights);
      if (typeof seed.cars === "number") setCars(seed.cars);
      if (seed.itinerary) setItinerary(seed.itinerary);
      share.clearUrlParam();
    }
    // One-shot migration: bump browsers still on a previous default start
    // date to the current one. We use the raw `seed.startDateISO` if the
    // share URL provided one, otherwise the persisted `startDateISO`.
    const effective = seed?.startDateISO ?? startDateISO;
    if (LEGACY_DEFAULT_START_DATES.has(effective)) {
      setStartDateISO(DEFAULT_START);
      if (nights !== DEFAULT_NIGHTS) setNights(DEFAULT_NIGHTS);
    }
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

  // ── Quick profiles: load a ready-made plan (base + itinerary). ──
  // The user's votes are NEVER touched — this is just a "load this draft
  // itinerary" action. Lets the family experiment freely with different
  // plans without losing anyone's vote history.
  const applyProfile = (profile) => {
    if (!profile) return;
    if (profile.base) setBaseId(profile.base);
    setItinerary(profile.days || {});
  };

  // ── Simulation mode ──
  // When `simulationMode` is true, the sync hook suspends POSTs of the
  // SHARED fields (baseId + itinerary) and skips adopting remote updates
  // for them. Votes and comments still sync normally — only the day plan
  // is sandboxed locally so the user can try things out without altering
  // what the rest of the family sees.
  const [simulationMode, setSimulationMode] = useState(false);

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
    simulationMode, setSimulationMode,
    budgetOverrides, setBudgetOverrides, setBudgetField,
    savedTick,
    buildShareUrl, resetAll,
  };
};
