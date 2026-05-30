import { useMemo } from "react";
import { colors, fonts, radii } from "../styles/tokens.js";
import { activityById } from "../data/activities.js";
import { placeById, ZONE_LABEL } from "../data/places.js";
import { baseById } from "../data/bases.js";

const HEAVY_DRIVE_MIN = 180; // round-trip total per day → "mucho coche"

// Heuristic checks over the current itinerary:
//   • Same activity id appearing in more than one day (data anomaly).
//   • Same place spread across multiple days (suggest grouping).
//   • Day with too much round-trip driving from the base.
// Pure derivation — no side effects, no API calls.
const computeWarnings = (itinerary, base) => {
  const warnings = [];

  // 1. Activities present in more than one day.
  const actToDays = {};
  for (const [k, list] of Object.entries(itinerary || {})) {
    for (const actId of list || []) {
      (actToDays[actId] = actToDays[actId] || []).push(Number(k));
    }
  }
  for (const [actId, days] of Object.entries(actToDays)) {
    if (days.length > 1) {
      const a = activityById(actId);
      warnings.push({
        id: `dup:${actId}`,
        kind: "duplicate",
        icon: "⚠️",
        text: `«${a?.name ?? actId}» aparece en ${days.length} días distintos (${days.map((d) => `Día ${d + 1}`).join(", ")}). Hazla solo una vez salvo que sea a propósito.`,
      });
    }
  }

  // 2. Same place split across multiple days (≥2 activities, ≥2 days).
  const placeMap = {}; // placeId → { days: Set, acts: Set }
  for (const [k, list] of Object.entries(itinerary || {})) {
    for (const actId of list || []) {
      const a = activityById(actId);
      if (!a) continue;
      const entry = (placeMap[a.placeId] = placeMap[a.placeId] || { days: new Set(), acts: new Set() });
      entry.days.add(Number(k));
      entry.acts.add(actId);
    }
  }
  for (const [placeId, info] of Object.entries(placeMap)) {
    if (info.days.size > 1 && info.acts.size > 1) {
      const place = placeById(placeId);
      const days = [...info.days].sort((a, b) => a - b);
      warnings.push({
        id: `split:${placeId}`,
        kind: "split-place",
        icon: "💡",
        text: `«${place?.name ?? placeId}» (${ZONE_LABEL[place?.zone] || "—"}) está partido en ${info.days.size} días (${days.map((d) => `Día ${d + 1}`).join(", ")}). Podríais agrupar esas visitas en un mismo día para ahorrar coche.`,
      });
    }
  }

  // 3. Heavy drive days. Only meaningful if a base is chosen.
  if (base) {
    for (const [k, list] of Object.entries(itinerary || {})) {
      let drive = 0;
      for (const actId of list || []) {
        const a = activityById(actId);
        const d = a && base.distances?.[a.placeId];
        if (d) drive += d.min * 2; // round-trip
      }
      if (drive > HEAVY_DRIVE_MIN) {
        const h = Math.floor(drive / 60);
        const m = drive % 60;
        warnings.push({
          id: `heavy:${k}`,
          kind: "heavy-drive",
          icon: "🚗",
          text: `Día ${Number(k) + 1}: ${h}h${m ? ` ${m}min` : ""} ida-y-vuelta desde la base. Igual está demasiado cargado.`,
        });
      }
    }
  }

  return warnings;
};

export const ItineraryWarnings = ({ state, size }) => {
  const base = baseById(state.baseId);
  const warnings = useMemo(() => computeWarnings(state.itinerary, base), [state.itinerary, base]);
  if (warnings.length === 0) return null;

  return (
    <details
      data-print="hide"
      open
      style={{
        background: colors.warningSoft,
        border: `1px solid ${colors.warning}`,
        borderRadius: radii.lg,
        padding: size.isMobile ? "10px 12px" : "12px 16px",
        marginBottom: "14px",
      }}
    >
      <summary style={{ cursor: "pointer", listStyle: "none", fontFamily: fonts.sans, fontWeight: 700, color: colors.warningText, fontSize: size.isMobile ? "13px" : "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>⚠️ {warnings.length} {warnings.length === 1 ? "aviso" : "avisos"} en tu plan</span>
        <span aria-hidden="true" className="chevron" style={{ transition: "transform 0.18s", color: colors.warningText }}>▾</span>
      </summary>
      <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0", display: "grid", gap: "6px" }}>
        {warnings.map((w) => (
          <li
            key={w.id}
            style={{
              display: "flex",
              gap: "8px",
              fontSize: size.isMobile ? "12px" : "12.5px",
              color: colors.text,
              lineHeight: 1.45,
            }}
          >
            <span aria-hidden="true" style={{ flex: "0 0 16px" }}>{w.icon}</span>
            <span style={{ flex: 1 }}>{w.text}</span>
          </li>
        ))}
      </ul>
    </details>
  );
};

export default ItineraryWarnings;
