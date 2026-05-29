// Cloudflare Pages Function: shared votes API for the trip.
//
// Storage shape in KV (single key per trip):
//   { byMember: { m1: ["actId", ...], m2: [...] }, updatedAt: "ISO" }
//
// GET  /api/votes?trip=<key>            → current blob (or empty if none)
// POST /api/votes?trip=<key> JSON       → { memberId, activityIds: [...] }
//   atomically replaces THAT member's list and bumps updatedAt — other
//   members' lists are preserved. This makes concurrent writes from
//   different family members safe.
//
// SETUP (one-time):
//   1. `npx wrangler kv namespace create VOTES_KV`
//   2. Pages → Settings → Functions → KV namespace bindings →
//      add binding name "VOTES_KV" pointing at the namespace above.
//   3. Push and let Pages redeploy — Functions ship automatically.
//
// The route uses Pages Functions' method handlers (no manual routing).

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const TRIP_RE = /^[a-z0-9_-]{4,40}$/;
const MEMBER_RE = /^m[a-z0-9]{1,16}$/;
const ACT_RE = /^[a-z0-9_]{1,40}$/;
const MAX_VOTES_PER_MEMBER = 200;
// One year (long-lived: this is the family trip plan).
const KV_TTL_SECONDS = 365 * 24 * 60 * 60;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

const empty = () => ({ byMember: {}, updatedAt: null });

export const onRequestOptions = () => new Response(null, { status: 204, headers: CORS });

export const onRequestGet = async ({ request, env }) => {
  if (!env.VOTES_KV) return json({ error: "KV not bound" }, 500);
  const trip = new URL(request.url).searchParams.get("trip") ?? "";
  if (!TRIP_RE.test(trip)) return json({ error: "Invalid trip key" }, 400);
  const raw = await env.VOTES_KV.get(trip);
  if (!raw) return json(empty());
  try { return json(JSON.parse(raw)); }
  catch { return json(empty()); }
};

export const onRequestPost = async ({ request, env }) => {
  if (!env.VOTES_KV) return json({ error: "KV not bound" }, 500);
  const trip = new URL(request.url).searchParams.get("trip") ?? "";
  if (!TRIP_RE.test(trip)) return json({ error: "Invalid trip key" }, 400);

  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Invalid JSON" }, 400); }

  const memberId = String(body?.memberId ?? "");
  const rawIds = Array.isArray(body?.activityIds) ? body.activityIds : null;
  if (!MEMBER_RE.test(memberId) || !rawIds) return json({ error: "Bad payload" }, 400);

  // Sanitise activity ids: only [a-z0-9_], cap length, dedupe.
  const activityIds = [...new Set(
    rawIds.map((x) => String(x)).filter((x) => ACT_RE.test(x)),
  )].slice(0, MAX_VOTES_PER_MEMBER);

  const raw = await env.VOTES_KV.get(trip);
  const existing = raw ? JSON.parse(raw) : empty();
  existing.byMember = existing.byMember ?? {};
  existing.byMember[memberId] = activityIds;
  existing.updatedAt = new Date().toISOString();

  await env.VOTES_KV.put(trip, JSON.stringify(existing), { expirationTtl: KV_TTL_SECONDS });
  return json(existing);
};
