// Encode/decode the shareable slice of trip state into a `?s=<base64>` URL.
// This is the LEGACY share mechanism (kept for one-shot link sharing). The
// cloud sync via /api/state is the source of truth for votes — `v` in the
// payload is still accepted as an initial seed.
//
// Members and active-member id were dropped from the payload because the
// roster is now a fixed constant (`data/team.js`) shared across browsers.
//
// Unicode-safe base64 via TextEncoder/TextDecoder (the deprecated
// escape/unescape trick is intentionally avoided).

const PARAM = "s";

// Round-trip a UTF-8 string through base64 without using the deprecated
// escape/unescape pair. Bytes are in the 0–255 range so codePointAt and
// fromCodePoint behave like fromCharCode/charCodeAt.
const utf8ToBase64 = (str) => {
  const bytes = new TextEncoder().encode(str);
  const bin = Array.from(bytes, (b) => String.fromCodePoint(b)).join("");
  return globalThis.btoa(bin);
};

const base64ToUtf8 = (b64) => {
  const bin = globalThis.atob(b64);
  const bytes = new Uint8Array(Array.from(bin, (c) => c.codePointAt(0)));
  return new TextDecoder().decode(bytes);
};

const encode = (obj) => {
  try { return utf8ToBase64(JSON.stringify(obj)); } catch { return ""; }
};

const decode = (str) => {
  try { return JSON.parse(base64ToUtf8(str)); } catch { return null; }
};

// Map full localStorage-ish state → compact share payload (short keys).
const toPayload = (s) => ({
  b: s.baseId ?? null,
  v: s.votes ?? {},
  d: s.startDateISO ?? null,
  n: s.nights ?? null,
  c: s.cars ?? null,
  it: s.itinerary ?? {},
});

const fromPayload = (p) => {
  if (!p || typeof p !== "object") return null;
  const out = {};
  if (p.b !== undefined) out.baseId = p.b;
  if (p.v && typeof p.v === "object") out.votes = p.v;
  if (typeof p.d === "string") out.startDateISO = p.d;
  if (typeof p.n === "number") out.nights = p.n;
  if (typeof p.c === "number") out.cars = p.c;
  if (p.it && typeof p.it === "object") out.itinerary = p.it;
  return out;
};

export const useShareableState = () => {
  // Read once at call time (used in the bootstrap effect of useTripState).
  const readFromUrl = () => {
    if (typeof globalThis.location === "undefined") return null;
    const params = new URLSearchParams(globalThis.location.search);
    const raw = params.get(PARAM);
    if (!raw) return null;
    return fromPayload(decode(raw));
  };

  // Strip the param after seeding so refreshes don't re-import.
  const clearUrlParam = () => {
    if (typeof globalThis.history === "undefined") return;
    const url = new URL(globalThis.location.href);
    if (!url.searchParams.has(PARAM)) return;
    url.searchParams.delete(PARAM);
    globalThis.history.replaceState({}, "", url.toString());
  };

  const buildShareUrl = (state) => {
    if (typeof globalThis.location === "undefined") return "";
    const base = `${globalThis.location.origin}${globalThis.location.pathname}`;
    return `${base}?${PARAM}=${encode(toPayload(state))}`;
  };

  return { readFromUrl, clearUrlParam, buildShareUrl };
};
