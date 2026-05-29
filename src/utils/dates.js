const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun",
                "jul", "ago", "sep", "oct", "nov", "dic"];

const DOW = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const formatDate = (d) =>
  `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

export const formatDateShort = (d) =>
  `${d.getDate()} ${MONTHS[d.getMonth()]}`;

// "vie 14 ago" — used in the day-by-day itinerary.
export const formatDow = (d) =>
  `${DOW[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;

// Days until a target ISO date (yyyy-mm-dd) from today. Negative = past.
export const daysUntil = (isoDate) => {
  const target = new Date(`${isoDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
};

// Human-friendly relative time ("hace 2 min", "hace 3 h", "ahora") for a
// past ISO timestamp. Returns "" when input is falsy.
export const relativeTime = (iso) => {
  if (!iso) return "";
  const t = typeof iso === "string" ? new Date(iso).getTime() : iso;
  if (!Number.isFinite(t)) return "";
  const diff = Math.max(0, Date.now() - t);
  const s = Math.floor(diff / 1000);
  if (s < 30) return "ahora";
  if (s < 60) return `hace ${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
};

// Severity level of a deadline relative to today.
//   "past"   → already passed
//   "soon"   → 0..14 days away
//   "future" → more than 14 days away
export const deadlineLevel = (iso) => {
  const d = daysUntil(iso);
  if (d < 0) return "past";
  if (d <= 14) return "soon";
  return "future";
};

export { MONTHS, DOW };
