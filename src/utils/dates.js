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

export { MONTHS, DOW };
