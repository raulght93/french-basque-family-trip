// The fixed roster of family members travelling. Hard-coded (not user-editable)
// so every browser sees the same names mapped to the same ids — required for
// shared voting via the cloud sync (see worker.js at the repo root and
// hooks/useTripSync.js). To rename someone, edit this file and redeploy.

// Note: ids are stable. If someone leaves (e.g. m4 was "María"), we drop the
// entry from this list but keep the id slot empty so any leftover votes by
// that id in KV stay attributable to the historical name and don't clobber
// the renumbering of the remaining members.
export const TEAM = [
  { id: "m1", name: "Antonio" },
  { id: "m2", name: "Mariví" },
  { id: "m3", name: "Jesús" },
  { id: "m5", name: "Antonio Jr" },
  { id: "m6", name: "Raúl" },
  { id: "m7", name: "Ainoa" },
  { id: "m8", name: "Elena" },
];

export const memberById = (id) => TEAM.find((m) => m.id === id) || null;
export const memberName = (id) => memberById(id)?.name ?? id;

// Trip key (shared bucket name on the cloud KV). One per trip — anyone
// reaching the deployed site participates in the same shared vote.
export const TRIP_KEY = "pvfamilia2026";

// Base URL of the trip-state API. Defaults to same-origin (`/api/state`) which is
// what the Worker in `worker.js` exposes. Override at build time with
// `VITE_API_BASE=https://other.workers.dev` if you split the API into a
// separate Worker.
export const API_BASE = import.meta.env.VITE_API_BASE ?? "";
