import { useMemo } from "react";
import { colors, fonts } from "../styles/tokens.js";
import { baseById } from "../data/bases.js";
import { ACTIVITIES, activityById } from "../data/activities.js";
import { placeById } from "../data/places.js";
import { CATEGORIES } from "../data/checklistItems.js";
import { computeBudget, BUDGET_DEFAULTS } from "../utils/budget.js";
import { formatDate, formatDow } from "../utils/dates.js";
import { useChecklist } from "../hooks/useChecklist.js";

const fmtDur = (min) => (min >= 60 ? `${Math.round((min / 60) * 10) / 10} h` : `${min} min`);

// Full single-document view for printing / saving as PDF: base decision +
// itinerary + budget + checklist. Rendered (and shown) only while printing.
export const PrintView = ({ state }) => {
  const base = baseById(state.baseId);
  const cl = useChecklist({ cars: state.cars });

  const selectedActivities = useMemo(() => {
    const ids = new Set(ACTIVITIES.filter((a) => state.isInterested(a.id)).map((a) => a.id));
    Object.values(state.itinerary).forEach((list) => (list || []).forEach((id) => ids.add(id)));
    return [...ids].map((id) => activityById(id)).filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.votes, state.itinerary]);

  const placeDistances = useMemo(() => {
    if (!base) return [];
    const places = new Set(selectedActivities.map((a) => a.placeId));
    return [...places].map((pid) => base.distances[pid]).filter(Boolean);
  }, [base, selectedActivities]);

  const o = state.budgetOverrides;
  const get = (k, d) => (o[k] != null ? o[k] : d);
  const budget = computeBudget({
    base,
    nights: state.nights,
    travelers: state.travelers,
    cars: state.cars,
    selectedActivities,
    placeDistances,
    overrides: {
      pricePerNight: get("pricePerNight", base?.pricePerNight ?? 0),
      foodPerDay: get("foodPerDay", BUDGET_DEFAULTS.foodPerDay),
      fuelPricePerL: get("fuelPricePerL", BUDGET_DEFAULTS.fuelPricePerL),
      consumption: get("consumption", BUDGET_DEFAULTS.consumption),
      includeHomeTrip: get("includeHomeTrip", BUDGET_DEFAULTS.includeHomeTrip),
    },
  });

  const h2 = { fontFamily: fonts.serif, fontSize: "20px", color: colors.text, margin: "22px 0 8px", borderBottom: `2px solid ${colors.accent}`, paddingBottom: "3px" };

  return (
    <div data-print="expand" style={{ maxWidth: 800, margin: "0 auto", fontFamily: fonts.sans, color: colors.text, padding: "10px" }}>
      <h1 style={{ fontFamily: fonts.serif, fontSize: "28px", marginBottom: "4px" }}>{state.tripName}</h1>
      <div style={{ fontSize: "13px", color: colors.textMuted }}>
        {formatDate(state.startDate)} → {formatDate(state.endDate)} · {state.nights} noches · {state.travelers} viajeros{state.cars > 1 ? ` · ${state.cars} coches` : ""}
      </div>

      {/* Base */}
      <h2 style={h2}>Alojamiento</h2>
      {base ? (
        <div style={{ fontSize: "13px", lineHeight: 1.5 }}>
          <strong>{base.name}</strong> · {base.town} · {base.status === "reserved" ? "Reservada" : "Sin reservar"}
          {base.bookingDeadline ? ` · cancelación/decisión: ${base.bookingDeadline}` : ""}
          <div style={{ color: colors.textMuted, marginTop: "3px" }}>{base.notes}</div>
        </div>
      ) : (
        <div style={{ fontSize: "13px", color: colors.textMuted }}>Base sin decidir.</div>
      )}

      {/* Itinerary */}
      <h2 style={h2}>Itinerario</h2>
      {state.days.map((d, i) => {
        const actIds = state.activitiesOnDay(i);
        return (
          <div key={i} style={{ marginBottom: "10px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>Día {i + 1} · {formatDow(d)}</div>
            {actIds.length === 0 ? (
              <div style={{ fontSize: "12.5px", color: colors.textSubtle, fontStyle: "italic" }}>Día libre</div>
            ) : (
              <ul style={{ margin: "3px 0 0 18px", fontSize: "12.5px", lineHeight: 1.6 }}>
                {actIds.map((id) => {
                  const a = activityById(id);
                  if (!a) return null;
                  return (
                    <li key={id}>
                      {a.lowMobilityOk === false && <strong style={{ color: colors.dangerText }}>⚠️ </strong>}
                      {a.name} <span style={{ color: colors.textMuted }}>— {placeById(a.placeId)?.name} · {fmtDur(a.durationMin)}{a.price > 0 ? ` · ${a.price} €` : ""}</span>
                      {a.lowMobilityOk === false && a.splitOption && (
                        <div style={{ fontSize: "11px", color: colors.textMuted, fontStyle: "italic", marginLeft: "10px" }}>
                          ✂️ {a.splitOption}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}

      {/* Budget */}
      <h2 style={h2}>Presupuesto estimado</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <tbody>
          {budget.lines.map((l) => (
            <tr key={l.key}>
              <td style={{ padding: "4px 0" }}>{l.label} <span style={{ color: colors.textSubtle, fontSize: "11px" }}>({l.detail})</span></td>
              <td style={{ padding: "4px 0", textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>{l.amount.toLocaleString("es-ES")} €</td>
            </tr>
          ))}
          <tr>
            <td style={{ padding: "8px 0 0", fontWeight: 800, color: colors.accent }}>Total ({state.travelers} pers · ≈ {budget.perPerson.toLocaleString("es-ES")} €/persona)</td>
            <td style={{ padding: "8px 0 0", textAlign: "right", fontWeight: 800, color: colors.accent, fontSize: "16px" }}>{budget.total.toLocaleString("es-ES")} €</td>
          </tr>
        </tbody>
      </table>

      {/* Checklist */}
      <h2 style={h2}>Checklist ({cl.done}/{cl.total})</h2>
      {CATEGORIES.map((c) => {
        const items = [...cl.autoItems, ...cl.customItems].filter((i) => i.category === c.id);
        if (items.length === 0) return null;
        return (
          <div key={c.id} style={{ marginBottom: "8px" }}>
            <div style={{ fontSize: "12.5px", fontWeight: 700 }}>{c.glyph} {c.label}</div>
            <ul style={{ margin: "2px 0 0 18px", fontSize: "12.5px", lineHeight: 1.55 }}>
              {items.map((i) => (
                <li key={i.id} style={{ textDecoration: cl.checked[i.id] ? "line-through" : "none", color: cl.checked[i.id] ? colors.textSubtle : colors.text }}>
                  {cl.checked[i.id] ? "☑" : "☐"} {i.label}{i.deadline ? ` (límite ${i.deadline})` : ""}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default PrintView;
