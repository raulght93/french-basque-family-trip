import { colors, fonts, radii } from "../styles/tokens.js";
import { formatDateShort } from "../utils/dates.js";

// Compact "where are we in the trip" chip rendered inside the Header.
// Three modes:
//   • pre   — countdown to the start date
//   • during — day N of M, with the current day's activity count
//   • post  — how long ago the trip ended
const dayDiff = (a, b) => Math.floor((b.getTime() - a.getTime()) / 86400000);

const compute = (state, today) => {
  if (!state?.startDate) return null;
  const start = new Date(state.startDate);
  if (Number.isNaN(start.getTime())) return null;
  const end = state.endDate ? new Date(state.endDate) : null;

  // Pre-trip.
  if (today < start) {
    const days = dayDiff(today, start);
    return {
      kind: "pre",
      label: days <= 1 ? "Empieza mañana" : `Faltan ${days} días`,
      sub: `Salida ${formatDateShort(start)}`,
    };
  }

  // Post-trip.
  if (end && today > end) {
    const days = dayDiff(end, today);
    return {
      kind: "post",
      label: days <= 1 ? "Acaba de terminar" : `Volvisteis hace ${days} d`,
      sub: `Cerró ${formatDateShort(end)}`,
    };
  }

  // During trip.
  const nDay = dayDiff(start, today) + 1;
  const total = (state.nights ?? 0) + 1;
  const actsToday = state.activitiesOnDay ? state.activitiesOnDay(nDay - 1) : [];
  const sub = actsToday.length === 0
    ? "Día libre"
    : `${actsToday.length} actividad${actsToday.length === 1 ? "" : "es"} hoy`;
  return {
    kind: "during",
    label: `Día ${nDay} de ${total}`,
    sub,
  };
};

const ACCENT = {
  pre: colors.accent,
  during: colors.success,
  post: colors.textSubtle,
};

export const TripStatus = ({ state, size, today = new Date() }) => {
  const s = compute(state, today);
  if (!s) return null;
  const accent = ACCENT[s.kind] || colors.accent;
  const compact = size?.isMobile;
  return (
    <div
      title={`${s.label} · ${s.sub}`}
      style={{
        background: `color-mix(in srgb, ${accent} 22%, ${colors.bgDarker})`,
        border: `1px solid ${accent}`,
        borderRadius: radii.lg,
        padding: compact ? "5px 9px" : "7px 11px",
        display: "inline-flex",
        flexDirection: "column",
        lineHeight: 1.2,
        flexShrink: 0,
        fontFamily: fonts.sans,
      }}
    >
      <span style={{ fontFamily: fonts.serif, fontSize: compact ? "12.5px" : "14px", fontWeight: 700, color: colors.textOnDark }}>
        {s.label}
      </span>
      <span style={{ fontSize: compact ? "10.5px" : "11.5px", color: colors.textOnDarkMuted, marginTop: "1px" }}>
        {s.sub}
      </span>
    </div>
  );
};

export default TripStatus;
