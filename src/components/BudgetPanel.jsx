import { useMemo } from "react";
import { colors, fonts, radii, shadows } from "../styles/tokens.js";
import { baseById } from "../data/bases.js";
import { ACTIVITIES, activityById } from "../data/activities.js";
import { computeBudget, BUDGET_DEFAULTS } from "../utils/budget.js";
import { MemberBar } from "./MemberBar.jsx";

const Stepper = ({ label, value, set, min = 0, max = 99, step = 1, suffix }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
    <span style={{ fontSize: "12px", color: colors.textMuted, fontFamily: fonts.sans }}>{label}</span>
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <button
        type="button"
        aria-label={`Restar ${label}`}
        onClick={() => set(Math.max(min, +(value - step).toFixed(2)))}
        style={stepBtn}
      >−</button>
      <span style={{ minWidth: "56px", textAlign: "center", fontSize: "15px", fontWeight: 700, color: colors.text, fontFamily: fonts.sans }}>
        {value}{suffix || ""}
      </span>
      <button
        type="button"
        aria-label={`Sumar ${label}`}
        onClick={() => set(Math.min(max, +(value + step).toFixed(2)))}
        style={stepBtn}
      >+</button>
    </div>
  </div>
);

const stepBtn = {
  width: "30px", height: "30px", borderRadius: radii.md,
  background: colors.bgPanel, border: `1px solid ${colors.border}`,
  color: colors.text, fontSize: "17px", fontWeight: 700, cursor: "pointer", lineHeight: 1,
};

export const BudgetPanel = ({ state, size }) => {
  const base = baseById(state.baseId);
  const o = state.budgetOverrides;
  const get = (k, d) => (o[k] != null ? o[k] : d);

  // Selected = voted by anyone OR scheduled in the itinerary.
  const selectedActivities = useMemo(() => {
    const ids = new Set(ACTIVITIES.filter((a) => state.isInterested(a.id)).map((a) => a.id));
    Object.values(state.itinerary).forEach((list) => (list || []).forEach((id) => ids.add(id)));
    return [...ids].map((id) => activityById(id)).filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.votes, state.itinerary]);

  // One round-trip leg per distinct place among selected activities.
  const placeDistances = useMemo(() => {
    if (!base) return [];
    const places = new Set(selectedActivities.map((a) => a.placeId));
    return [...places].map((pid) => base.distances[pid]).filter(Boolean);
  }, [base, selectedActivities]);

  const budget = useMemo(
    () =>
      computeBudget({
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
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [base, state.nights, state.travelers, state.cars, selectedActivities, placeDistances, o],
  );

  const card = { background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: radii.lg, padding: size.isMobile ? "14px" : "18px", boxShadow: shadows.sm };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontFamily: fonts.serif, fontSize: size.isMobile ? "26px" : "32px", color: colors.text, marginBottom: "16px" }}>
        Presupuesto
      </h2>

      {/* Trip params */}
      <section style={{ ...card, marginBottom: "16px" }}>
        <div style={{ fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: colors.accent, fontWeight: 700, marginBottom: "12px" }}>
          Datos del viaje
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <span style={{ fontSize: "12px", color: colors.textMuted, fontFamily: fonts.sans }}>Fecha de inicio</span>
            <input
              type="date"
              value={state.startDateISO}
              onChange={(e) => state.setStartDate(e.target.value)}
              style={{ background: colors.bgPanel, color: colors.text, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: "7px 10px", fontSize: "14px", fontFamily: fonts.sans }}
            />
          </div>
          <Stepper label="Noches" value={state.nights} set={state.setNights} min={1} max={30} />
          <Stepper label="Coches" value={state.cars} set={state.setCars} min={1} max={6} />
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <span style={{ fontSize: "12px", color: colors.textMuted, fontFamily: fonts.sans }}>Participantes</span>
            <span style={{ fontSize: "15px", fontWeight: 700, color: colors.text, fontFamily: fonts.sans, padding: "5px 0" }}>
              👥 {state.travelers}
            </span>
          </div>
        </div>
        <div style={{ marginTop: "14px" }}>
          <MemberBar state={state} />
        </div>
        <p style={{ fontSize: "11.5px", color: colors.textSubtle, marginTop: "8px", fontStyle: "italic" }}>
          El nº de viajeros del presupuesto = nº de participantes. Añade o quita personas arriba.
        </p>
      </section>

      {!base && (
        <div style={{ ...card, marginBottom: "16px", background: colors.warningSoft, border: `1px solid ${colors.warning}`, color: colors.warningText, fontSize: "13.5px" }}>
          ⚠️ Aún no has elegido base. El alojamiento y el combustible usan 0 hasta que decidas en la pestaña «Decidir base».
        </div>
      )}

      {/* Editable assumptions */}
      <section style={{ ...card, marginBottom: "16px" }}>
        <div style={{ fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: colors.accent, fontWeight: 700, marginBottom: "12px" }}>
          Supuestos (editables)
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "flex-end" }}>
          <Stepper label="€/noche alojamiento" value={get("pricePerNight", base?.pricePerNight ?? 0)} set={(v) => state.setBudgetField("pricePerNight", v)} min={0} max={1000} step={5} suffix=" €" />
          <Stepper label="Comida €/persona/día" value={get("foodPerDay", BUDGET_DEFAULTS.foodPerDay)} set={(v) => state.setBudgetField("foodPerDay", v)} min={0} max={200} step={5} suffix=" €" />
          <Stepper label="Combustible €/L" value={get("fuelPricePerL", BUDGET_DEFAULTS.fuelPricePerL)} set={(v) => state.setBudgetField("fuelPricePerL", v)} min={1} max={3} step={0.05} suffix=" €" />
          <Stepper label="Consumo L/100km" value={get("consumption", BUDGET_DEFAULTS.consumption)} set={(v) => state.setBudgetField("consumption", v)} min={3} max={20} step={0.5} />
        </div>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "14px", fontSize: "13px", color: colors.textBody, fontFamily: fonts.sans, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={get("includeHomeTrip", BUDGET_DEFAULTS.includeHomeTrip)}
            onChange={(e) => state.setBudgetField("includeHomeTrip", e.target.checked)}
            style={{ width: "17px", height: "17px", accentColor: colors.green, cursor: "pointer" }}
          />
          Incluir el viaje de ida y vuelta desde casa{base ? ` (${base.fromHome.km} km)` : ""}
        </label>
      </section>

      {/* Breakdown */}
      <section style={card}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: fonts.sans }}>
          <tbody>
            {budget.lines.map((l) => (
              <tr key={l.key} style={{ borderBottom: `1px solid ${colors.border}` }}>
                <td style={{ padding: "11px 0", verticalAlign: "top" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>{l.label}</div>
                  <div style={{ fontSize: "11.5px", color: colors.textSubtle }}>{l.detail}</div>
                </td>
                <td style={{ padding: "11px 0", textAlign: "right", fontSize: "15px", fontWeight: 700, color: colors.text, whiteSpace: "nowrap", verticalAlign: "top" }}>
                  {l.amount.toLocaleString("es-ES")} €
                </td>
              </tr>
            ))}
            <tr>
              <td style={{ padding: "14px 0 0", fontSize: "16px", fontWeight: 700, color: colors.accent }}>Total</td>
              <td style={{ padding: "14px 0 0", textAlign: "right", fontSize: "22px", fontWeight: 800, color: colors.accent, whiteSpace: "nowrap" }}>
                {budget.total.toLocaleString("es-ES")} €
              </td>
            </tr>
            <tr>
              <td style={{ fontSize: "12.5px", color: colors.textMuted }}>≈ por persona ({state.travelers})</td>
              <td style={{ textAlign: "right", fontSize: "13.5px", color: colors.textMuted, whiteSpace: "nowrap" }}>
                {budget.perPerson.toLocaleString("es-ES")} €
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <p style={{ fontSize: "11.5px", color: colors.textSubtle, marginTop: "12px", fontStyle: "italic", lineHeight: 1.5 }}>
        Las entradas cuentan las actividades marcadas como «nos interesa» o asignadas al itinerario
        ({selectedActivities.length} actividad/es). Los precios de alojamiento son una estimación: ajústalos cuando
        tengáis la tarifa real.
      </p>
    </div>
  );
};

export default BudgetPanel;
