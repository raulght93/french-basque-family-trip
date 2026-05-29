// Cloudflare Worker for the trip app.
//
// Two responsibilities:
//   1. /api/votes  — shared family votes, persisted in a KV namespace.
//   2. anything else → served as a static asset from ./dist (the Vite build).
//
// SETUP (one-time, see DEPLOY.md):
//   • Create the KV: `npx wrangler kv namespace create VOTES_KV`
//     (and `--preview` too). Paste both ids into wrangler.jsonc.
//   • Then `npm run deploy` → `vite build && wrangler deploy`.
//
// API storage shape (one key per trip):
//   { byMember: { m1: ["actId",…], m2: [...], … }, updatedAt: "ISO" }
//
// POST atomically replaces ONLY the caller's member entry — concurrent
// writes from different family members don't collide.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const TRIP_RE = /^[a-z0-9_-]{4,40}$/;
const MEMBER_RE = /^m[a-z0-9]{1,16}$/;
const ACT_RE = /^[a-z0-9_]{1,40}$/;
const MAX_VOTES_PER_MEMBER = 200;
const KV_TTL_SECONDS = 365 * 24 * 60 * 60; // 1 year

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

const empty = () => ({ byMember: {}, updatedAt: null });

async function handleGet(url, env) {
  const trip = url.searchParams.get("trip") ?? "";
  if (!TRIP_RE.test(trip)) return json({ error: "Invalid trip key" }, 400);
  const raw = await env.VOTES_KV.get(trip);
  if (!raw) return json(empty());
  try { return json(JSON.parse(raw)); }
  catch { return json(empty()); }
}

async function handlePost(request, url, env) {
  const trip = url.searchParams.get("trip") ?? "";
  if (!TRIP_RE.test(trip)) return json({ error: "Invalid trip key" }, 400);

  let body;
  try { body = await request.json(); }
  catch { return json({ error: "Invalid JSON" }, 400); }

  const memberId = String(body?.memberId ?? "");
  const rawIds = Array.isArray(body?.activityIds) ? body.activityIds : null;
  if (!MEMBER_RE.test(memberId) || !rawIds) return json({ error: "Bad payload" }, 400);

  const activityIds = [...new Set(
    rawIds.map(String).filter((x) => ACT_RE.test(x)),
  )].slice(0, MAX_VOTES_PER_MEMBER);

  const raw = await env.VOTES_KV.get(trip);
  const existing = raw ? JSON.parse(raw) : empty();
  existing.byMember = existing.byMember ?? {};
  existing.byMember[memberId] = activityIds;
  existing.updatedAt = new Date().toISOString();

  await env.VOTES_KV.put(trip, JSON.stringify(existing), { expirationTtl: KV_TTL_SECONDS });
  return json(existing);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/votes") {
      if (!env.VOTES_KV) return json({ error: "KV not bound" }, 500);
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
      if (request.method === "GET") return handleGet(url, env);
      if (request.method === "POST") return handlePost(request, url, env);
      return json({ error: "Method not allowed" }, 405);
    }

    // Anything else → static asset served from ./dist by the ASSETS binding.
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response("Not found", { status: 404 });
  },
};
