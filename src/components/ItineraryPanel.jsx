import { colors, fonts, radii, shadows } from "../styles/tokens.js";
import { ACTIVITIES, activityById, TYPE_META } from "../data/activities.js";
import { placeById } from "../data/places.js";
import { baseById } from "../data/bases.js";
import { formatDow } from "../utils/dates.js";
import { ProfilesBar } from "./ProfilesBar.jsx";

const fmtDur = (min) => (min >= 60 ? `${Math.round((min / 60) * 10) / 10} h` : `${min} min`);

export const ItineraryPanel = ({ state, size }) => {
  const base = baseById(state.baseId);

  const dayTotals = (actIds) => {
    let onSite = 0;
    let drive = 0;
    actIds.forEach((id) => {
      const a = activityById(id);
      if (!a) return;
      onSite += a.durationMin || 0;
      const d = base?.distances?.[a.placeId];
      if (d) drive += d.min * 2; // round trip from base
    });
    return { onSite, drive };
  };

  const unscheduledInterest = ACTIVITIES.filter(
    (a) => state.isInterested(a.id) && !state.isScheduled(a.id),
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ fontFamily: fonts.serif, fontSize: size.isMobile ? "26px" : "32px", color: colors.text, marginBottom: "6px" }}>
        Itinerario
      </h2>
      <p style={{ fontFamily: fonts.sans, fontSize: "14px", color: colors.textMuted, marginBottom: "18px", lineHeight: 1.5 }}>
        {base
          ? `Tiempos de coche calculados desde ${base.name} (${base.town}), ida y vuelta.`
          : "Elige una base para ver los tiempos de coche de cada día."}
      </p>

      <ProfilesBar state={state} size={size} />

      <div style={{ display: "grid", gridTemplateColumns: size.isDesktop ? "1fr 1fr" : "1fr", gap: "14px" }}>
        {state.days.map((d, i) => {
          const actIds = state.activitiesOnDay(i);
          const { onSite, drive } = dayTotals(actIds);
          return (
            <section
              key={i}
              style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: radii.lg,
                padding: "16px",
                boxShadow: shadows.sm,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px" }}>
                <h3 style={{ fontFamily: fonts.serif, fontSize: "21px", color: colors.text }}>
                  Día {i + 1}
                  <span style={{ fontFamily: fonts.sans, fontSize: "13px", color: colors.textMuted, fontWeight: 400, marginLeft: "8px" }}>
                    {formatDow(d)}
                  </span>
                </h3>
                {actIds.length > 0 && (
                  <span style={{ fontSize: "11.5px", color: colors.textSubtle }}>
                    🚗 {fmtDur(drive)} · ⏱️ {fmtDur(onSite)}
                  </span>
                )}
              </div>

              {actIds.length === 0 ? (
                <p style={{ fontSize: "13px", color: colors.textSubtle, fontStyle: "italic", padding: "8px 0" }}>
                  Día libre. Asigna actividades desde abajo o desde la pestaña Actividades.
                </p>
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "7px" }}>
                  {actIds.map((id, idx) => {
                    const a = activityById(id);
                    if (!a) return null;
                    const tm = TYPE_META[a.type] || {};
                    const arrowStyle = (disabled) => ({
                      background: "transparent", border: "none",
                      color: disabled ? colors.border : colors.textMuted,
                      cursor: disabled ? "default" : "pointer", fontSize: "12px", lineHeight: 1, padding: "1px 3px",
                    });
                    return (
                      <li key={id} style={{ display: "flex", alignItems: "center", gap: "9px", background: colors.bgPanel, borderRadius: radii.md, padding: "8px 10px" }}>
                        <span data-print="hide" style={{ display: "flex", flexDirection: "column" }}>
                          <button type="button" aria-label={`Subir ${a.name}`} disabled={idx === 0} onClick={() => state.moveActivityInDay(i, id, -1)} style={arrowStyle(idx === 0)}>▲</button>
                          <button type="button" aria-label={`Bajar ${a.name}`} disabled={idx === actIds.length - 1} onClick={() => state.moveActivityInDay(i, id, 1)} style={arrowStyle(idx === actIds.length - 1)}>▼</button>
                        </span>
                        <span aria-hidden="true" style={{ fontSize: "16px" }}>{tm.glyph}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13.5px", fontWeight: 600, color: colors.text }}>{a.name}</div>
                          <div style={{ fontSize: "11.5px", color: colors.textMuted }}>
                            {placeById(a.placeId)?.name} · {fmtDur(a.durationMin)}{a.price > 0 ? ` · ${a.price} €` : ""}
                          </div>
                        </div>
                        <button
                          type="button"
                          data-print="hide"
                          aria-label={`Quitar ${a.name} del día`}
                          onClick={() => state.unassignActivity(id)}
                          style={{ background: "transparent", border: "none", color: colors.textSubtle, cursor: "pointer", fontSize: "16px", padding: "2px 4px" }}
                        >
                          ✕
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      {/* Unscheduled interests */}
      {unscheduledInterest.length > 0 && (
        <section style={{ marginTop: "20px", background: colors.bgPanel, border: `1px solid ${colors.border}`, borderRadius: radii.lg, padding: "16px" }}>
          <div style={{ fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: colors.accent, fontWeight: 700, marginBottom: "10px" }}>
            ♥ Marcadas sin asignar ({unscheduledInterest.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {unscheduledInterest.map((a) => {
              const tm = TYPE_META[a.type] || {};
              return (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "9px", flexWrap: "wrap" }}>
                  <span aria-hidden="true">{tm.glyph}</span>
                  <span style={{ flex: 1, minWidth: 140, fontSize: "13.5px", color: colors.text }}>
                    {a.name} <span style={{ color: colors.textMuted, fontSize: "12px" }}>· {placeById(a.placeId)?.name}</span>
                  </span>
                  <select
                    aria-label={`Asignar ${a.name} a un día`}
                    defaultValue=""
                    onChange={(e) => e.target.value !== "" && state.assignActivity(Number(e.target.value), a.id)}
                    style={{
                      background: colors.bgCard, color: colors.textBody, border: `1px solid ${colors.border}`,
                      borderRadius: radii.md, padding: "6px 9px", fontSize: "12.5px", fontFamily: fonts.sans, cursor: "pointer",
                    }}
                  >
                    <option value="">Asignar a…</option>
                    {state.days.map((d, i) => (
                      <option key={i} value={i}>Día {i + 1} · {formatDow(d)}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default ItineraryPanel;
