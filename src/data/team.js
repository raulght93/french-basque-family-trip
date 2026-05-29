// The fixed roster of family members travelling. Hard-coded (not user-editable)
// so every browser sees the same names mapped to the same ids — required for
// shared voting via the cloud sync (see functions/api/votes.js and
// hooks/useVotesSync.js). To rename someone, edit this file and redeploy.

export const TEAM = [
  { id: "m1", name: "Antonio" },
  { id: "m2", name: "Mariví" },
  { id: "m3", name: "Jesús" },
  { id: "m4", name: "María" },
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

// Base URL of the votes API. Defaults to same-origin (`/api/votes`) which is
// what the Cloudflare Pages Function provides; override at build time with
// `VITE_API_BASE=https://other.workers.dev` if you point at a separate Worker.
export const API_BASE = import.meta.env.VITE_API_BASE ?? "";
