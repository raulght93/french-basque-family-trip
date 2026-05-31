// Cloudflare Worker for the trip app.
//
// Responsibilities:
//   1. /api/state — shared trip state (votes, comments, base, itinerary,
//      presence, recent activity log). One KV key per trip.
//   2. anything else → served as a static asset from ./dist via env.ASSETS.
//
// Storage shape (one key per TRIP_KEY):
//   {
//     byMember: { m1: ["actId",…], … },               // votes
//     comments: { actId: { m1: { text, ts }, … }, … },// one comment per (act, member)
//     shared: {
//       baseId: "..." | null,
//       baseUpdatedBy, baseUpdatedAt,
//       itinerary: { "0": ["actId"], "1": [...], … },
//       itineraryUpdatedBy, itineraryUpdatedAt,
//     },
//     presence: { m1: "ISO", … },                     // last-seen per member
//     log:      [{ ts, memberId, kind, summary }, …], // ring buffer, last 50
//     updatedAt: "ISO",
//   }
//
// POST dispatches by `kind`:
//   • "votes"     { memberId, activityIds }            — per-member merge
//   • "comment"   { memberId, activityId, text }       — empty text = delete
//   • "shared"    { memberId, patch: { baseId?, itinerary? } }
//   • "ping"      { memberId }                         — only bumps presence
//
// GET supports `?me=mX` to bump presence on read.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const TRIP_RE = /^[a-z0-9_-]{4,40}$/;
const MEMBER_RE = /^m[a-z0-9]{1,16}$/;
const ACT_RE = /^[a-z0-9_]{1,40}$/;
const BASE_ID_RE = /^[a-z0-9_]{2,40}$/;
const MAX_VOTES_PER_MEMBER = 200;
const MAX_LOG = 50;
const MAX_COMMENT_LEN = 300;
const MAX_DAYS = 31;
const MAX_ACTS_PER_DAY = 30;
const PRESENCE_REFRESH_MS = 30_000;
const KV_TTL_SECONDS = 365 * 24 * 60 * 60;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

const empty = () => ({
  byMember: {},
  comments: {},
  shared: {
    baseId: null,
    baseUpdatedBy: null,
    baseUpdatedAt: null,
    itinerary: {},
    itineraryUpdatedBy: null,
    itineraryUpdatedAt: null,
    budget: {},
    budgetUpdatedBy: null,
    budgetUpdatedAt: null,
    cars: null,
    carsUpdatedBy: null,
    carsUpdatedAt: null,
  },
  presence: {},
  log: [],
  updatedAt: null,
});

// Whitelisted budget keys. We only persist these to avoid storing arbitrary
// data on KV; everything else in the incoming patch is dropped.
const BUDGET_KEYS = ["pricePerNight", "foodPerDay", "fuelPricePerL", "consumption", "includeHomeTrip"];

const sanitiseBudget = (b) => {
  const out = {};
  if (!b || typeof b !== "object") return out;
  for (const k of BUDGET_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) continue;
    const v = b[k];
    if (typeof v === "boolean") out[k] = v;
    else if (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100000) out[k] = v;
  }
  return out;
};

const sanitiseItinerary = (it) => {
  const out = {};
  if (!it || typeof it !== "object") return out;
  for (const [k, v] of Object.entries(it)) {
    if (!/^\d+$/.test(k) || Number(k) >= MAX_DAYS) continue;
    if (!Array.isArray(v)) continue;
    out[k] = [...new Set(v.map(String).filter((x) => ACT_RE.test(x)))].slice(0, MAX_ACTS_PER_DAY);
  }
  return out;
};

const sanitiseActivityIds = (raw) =>
  [...new Set((raw ?? []).map(String).filter((x) => ACT_RE.test(x)))].slice(0, MAX_VOTES_PER_MEMBER);

const prependLog = (state, entry) => {
  state.log = [entry, ...(state.log ?? [])].slice(0, MAX_LOG);
};

const readState = async (env, trip) => {
  const raw = await env.VOTES_KV.get(trip);
  if (!raw) return empty();
  try {
    const parsed = JSON.parse(raw);
    // Backward-compat: ensure new fields exist.
    parsed.comments ??= {};
    parsed.shared ??= empty().shared;
    parsed.presence ??= {};
    parsed.log ??= [];
    return parsed;
  } catch {
    return empty();
  }
};

const writeState = (env, trip, state) =>
  env.VOTES_KV.put(trip, JSON.stringify(state), { expirationTtl: KV_TTL_SECONDS });

async function handleGet(url, env) {
  const trip = url.searchParams.get("trip") ?? "";
  if (!TRIP_RE.test(trip)) return json({ error: "Invalid trip key" }, 400);
  const me = url.searchParams.get("me") ?? "";
  const state = await readState(env, trip);

  // Bump presence on read if `?me=` is supplied and last seen is stale.
  if (MEMBER_RE.test(me)) {
    const last = state.presence[me];
    const now = Date.now();
    if (!last || now - new Date(last).getTime() > PRESENCE_REFRESH_MS) {
      state.presence[me] = new Date(now).toISOString();
      await writeState(env, trip, state);
    }
  }
  return json(state);
}

async function handlePost(request, url, env) {
  const trip = url.searchParams.get("trip") ?? "";
  if (!TRIP_RE.test(trip)) return json({ error: "Invalid trip key" }, 400);

  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Invalid JSON" }, 400); }

  const memberId = String(body?.memberId ?? "");
  if (!MEMBER_RE.test(memberId)) return json({ error: "Bad memberId" }, 400);
  const kind = String(body?.kind ?? "votes");

  const state = await readState(env, trip);
  const now = new Date().toISOString();
  state.presence[memberId] = now;

  if (kind === "votes") {
    const ids = sanitiseActivityIds(body?.activityIds);
    if (!Array.isArray(body?.activityIds)) return json({ error: "Bad activityIds" }, 400);
    const before = (state.byMember[memberId] ?? []).length;
    state.byMember[memberId] = ids;
    prependLog(state, { ts: now, memberId, kind: "vote", summary: `Cambió sus votos (${ids.length}, antes ${before})` });
  }
  else if (kind === "comment") {
    const activityId = String(body?.activityId ?? "");
    if (!ACT_RE.test(activityId)) return json({ error: "Bad activityId" }, 400);
    const text = String(body?.text ?? "").slice(0, MAX_COMMENT_LEN).trim();
    state.comments[activityId] ??= {};
    if (text) {
      state.comments[activityId][memberId] = { text, ts: now };
      prependLog(state, { ts: now, memberId, kind: "comment", summary: `Comentó en una actividad — "${text.slice(0, 60)}${text.length > 60 ? "…" : ""}"` });
    } else {
      delete state.comments[activityId][memberId];
      if (Object.keys(state.comments[activityId]).length === 0) delete state.comments[activityId];
      prependLog(state, { ts: now, memberId, kind: "comment", summary: "Borró su comentario" });
    }
  }
  else if (kind === "shared") {
    const patch = body?.patch ?? {};
    if (Object.prototype.hasOwnProperty.call(patch, "baseId")) {
      const bid = patch.baseId == null ? null : String(patch.baseId);
      if (bid !== null && !BASE_ID_RE.test(bid)) return json({ error: "Bad baseId" }, 400);
      if (state.shared.baseId !== bid) {
        state.shared.baseId = bid;
        state.shared.baseUpdatedBy = memberId;
        state.shared.baseUpdatedAt = now;
        prependLog(state, { ts: now, memberId, kind: "base", summary: bid ? `Eligió la base "${bid}"` : "Quitó la base elegida" });
      }
    }
    if (Object.prototype.hasOwnProperty.call(patch, "itinerary")) {
      const it = sanitiseItinerary(patch.itinerary);
      state.shared.itinerary = it;
      state.shared.itineraryUpdatedBy = memberId;
      state.shared.itineraryUpdatedAt = now;
      const total = Object.values(it).reduce((s, list) => s + list.length, 0);
      prependLog(state, { ts: now, memberId, kind: "itinerary", summary: `Actualizó el itinerario (${total} actividades en ${Object.keys(it).length} días)` });
    }
    if (Object.prototype.hasOwnProperty.call(patch, "budget")) {
      const budget = sanitiseBudget(patch.budget);
      const prev = state.shared.budget || {};
      // Only log if it actually changed (avoid noise from no-op pushes).
      const changedKeys = BUDGET_KEYS.filter((k) => prev[k] !== budget[k]);
      state.shared.budget = budget;
      state.shared.budgetUpdatedBy = memberId;
      state.shared.budgetUpdatedAt = now;
      if (changedKeys.length > 0) {
        prependLog(state, { ts: now, memberId, kind: "budget", summary: `Ajustó el presupuesto (${changedKeys.join(", ")})` });
      }
    }
    if (Object.prototype.hasOwnProperty.call(patch, "cars")) {
      const n = patch.cars;
      if (typeof n === "number" && Number.isFinite(n) && n >= 1 && n <= 20 && state.shared.cars !== n) {
        const prev = state.shared.cars;
        state.shared.cars = n;
        state.shared.carsUpdatedBy = memberId;
        state.shared.carsUpdatedAt = now;
        prependLog(state, { ts: now, memberId, kind: "cars", summary: `Ahora viajáis con ${n} coche${n === 1 ? "" : "s"}${prev != null ? ` (antes ${prev})` : ""}` });
      }
    }
  }
  else if (kind !== "ping") {
    return json({ error: "Unknown kind" }, 400);
  }

  state.updatedAt = now;
  await writeState(env, trip, state);
  return json(state);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/state") {
      if (!env.VOTES_KV) return json({ error: "KV not bound" }, 500);
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
      if (request.method === "GET")  return handleGet(url, env);
      if (request.method === "POST") return handlePost(request, url, env);
      return json({ error: "Method not allowed" }, 405);
    }

    // Anything else → static asset from ./dist via the ASSETS binding.
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("Not found", { status: 404 });
  },
};
