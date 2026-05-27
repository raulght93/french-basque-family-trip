import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage, STORAGE_PREFIX, clearAllStorage } from "./useLocalStorage.js";
import { useShareableState } from "./useShareableState.js";
import { addDays } from "../utils/dates.js";

// Single source of truth for the trip. Deliberately light: no phases, forks or
// tiers — a chosen base, group votes on activities, the dates, the day-by-day
// itinerary, and headcount/cars for the budget.

const K = (name) => `${STORAGE_PREFIX}${name}`;

// Fixed trip name (no longer user-editable).
export const TRIP_NAME = "Viaje familiar País Vasco francés";

// Default: a week in August 2026 (the proposal's hours are August; the booking
// deadlines fall in July/August). 6 nights → 7 days.
const DEFAULT_START = "2026-08-08";
const DEFAULT_NIGHTS = 6;

// Default participants: 8 people (one family). Fully editable in the UI
// (add / remove / rename) — the group size can change. The budget headcount
// (`travelers`) is derived from this list, so there's a single source of truth.
const DEFAULT_MEMBERS = [
  { id: "m1", name: "Persona 1" },
  { id: "m2", name: "Persona 2" },
  { id: "m3", name: "Persona 3" },
  { id: "m4", name: "Persona 4" },
  { id: "m5", name: "Persona 5" },
  { id: "m6", name: "Persona 6" },
  { id: "m7", name: "Persona 7" },
  { id: "m8", name: "Persona 8" },
];

const toDate = (iso) => new Date(`${iso}T00:00:00`);

export const useTripState = () => {
  const share = useShareableState();

  const [baseId, setBaseId] = useLocalStorage(K("baseId"), null);
  const [members, setMembers] = useLocalStorage(K("members"), DEFAULT_MEMBERS);
  const [activeMemberId, setActiveMemberId] = useLocalStorage(K("activeMember"), "m1");
  const [votes, setVotes] = useLocalStorage(K("votes"), {}); // { activityId: [memberId,...] }
  const [startDateISO, setStartDateISO] = useLocalStorage(K("startDate"), DEFAULT_START);
  const [nights, setNights] = useLocalStorage(K("nights"), DEFAULT_NIGHTS);
  const [cars, setCars] = useLocalStorage(K("cars"), 1);

  // Budget headcount = number of participants (single source of truth).
  const travelers = members.length;
  const [itinerary, setItinerary] = useLocalStorage(K("itinerary"), {});
  const [budgetOverrides, setBudgetOverrides] = useLocalStorage(K("budget"), {});

  // ── Bootstrap from a shared URL exactly once. ──
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    const seed = share.readFromUrl();
    if (!seed) return;
    if (seed.baseId !== undefined) setBaseId(seed.baseId);
    if (Array.isArray(seed.members) && seed.members.length) setMembers(seed.members);
    if (seed.activeMemberId) setActiveMemberId(seed.activeMemberId);
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

  // ── Members ──
  const addMember = (name) =>
    setMembers((prev) => [...prev, { id: `m${Date.now()}`, name: name || `Persona ${prev.length + 1}` }]);
  const renameMember = (id, name) =>
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, name } : m)));
  const removeMember = (id) =>
    setMembers((prev) => {
      const next = prev.filter((m) => m.id !== id);
      // Drop this member's votes.
      setVotes((v) => {
        const nv = {};
        for (const [act, list] of Object.entries(v)) nv[act] = (list || []).filter((x) => x !== id);
        return nv;
      });
      if (activeMemberId === id && next[0]) setActiveMemberId(next[0].id);
      return next.length ? next : DEFAULT_MEMBERS;
    });
  const memberName = (id) => members.find((m) => m.id === id)?.name ?? id;

  // ── Votes ──
  const votersOf = (actId) => votes[actId] || [];
  const voteCount = (actId) => votersOf(actId).length;
  const hasVoted = (actId, memberId) => votersOf(actId).includes(memberId);
  const toggleVote = (actId, memberId) =>
    setVotes((prev) => {
      const list = prev[actId] || [];
      const next = list.includes(memberId) ? list.filter((x) => x !== memberId) : [...list, memberId];
      return { ...prev, [actId]: next };
    });

  // An activity "interesa" if anyone voted for it.
  const isInterested = (actId) => voteCount(actId) > 0;

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
  // Reorder an activity within its day (dir: -1 up, +1 down).
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
  // Replaces current votes and itinerary; every plan activity is voted by all
  // current participants so it shows up everywhere immediately.
  const applyProfile = (profile) => {
    if (!profile) return;
    if (profile.base) setBaseId(profile.base);
    const memberIds = members.map((m) => m.id);
    const ids = new Set();
    Object.values(profile.days || {}).forEach((list) => (list || []).forEach((id) => ids.add(id)));
    const nv = {};
    ids.forEach((id) => { nv[id] = [...memberIds]; });
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
  }, [baseId, members, votes, startDateISO, nights, cars, itinerary, budgetOverrides]);

  const buildShareUrl = () =>
    share.buildShareUrl({ baseId, members, activeMemberId, votes, startDateISO, nights, cars, itinerary });

  const resetAll = () => {
    clearAllStorage();
    if (typeof globalThis.location !== "undefined") globalThis.location.reload();
  };

  return {
    tripName: TRIP_NAME,
    baseId, setBaseId,
    members, addMember, renameMember, removeMember, memberName,
    activeMemberId, setActiveMemberId,
    votes, votersOf, voteCount, hasVoted, toggleVote, isInterested,
    startDate, startDateISO, setStartDate, endDate,
    nights, setNights, days,
    travelers, cars, setCars,
    itinerary, activitiesOnDay, isScheduled, dayOfActivity,
    assignActivity, unassignActivity, moveActivityInDay,
    applyProfile,
    budgetOverrides, setBudgetField,
    savedTick,
    buildShareUrl, resetAll,
  };
};
