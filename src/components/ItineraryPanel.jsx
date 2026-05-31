import { useState } from "react";
import { colors, fonts, radii, shadows } from "../styles/tokens.js";
import { ACTIVITIES, activityById, TYPE_META } from "../data/activities.js";
import { placeById } from "../data/places.js";
import { baseById } from "../data/bases.js";
import { formatDow, relativeTime } from "../utils/dates.js";
import { ProfilesBar } from "./ProfilesBar.jsx";
import { ItineraryWarnings } from "./ItineraryWarnings.jsx";

const fmtDur = (min) => (min >= 60 ? `${Math.round((min / 60) * 10) / 10} h` : `${min} min`);

const DRAG_MIME = "application/x-fbt-activity";

// Drag payload helpers. Use both an app-specific MIME and a text fallback so
// the browser doesn't complain about empty drags and other apps can ignore it.
const setDragPayload = (e, actId) => {
  const data = JSON.stringify({ actId });
  e.dataTransfer.setData(DRAG_MIME, data);
  e.dataTransfer.setData("text/plain", data);
  e.dataTransfer.effectAllowed = "move";
};
const readDragPayload = (e) => {
  try {
    const raw = e.dataTransfer.getData(DRAG_MIME) || e.dataTransfer.getData("text/plain");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.actId ? parsed : null;
  } catch {
    return null;
  }
};

export const ItineraryPanel = ({ state, size }) => {
  const base = baseById(state.baseId);
  const [dragOver, setDragOver] = useState(null); // e.g. "day:3", "item:3:1", "unsched"

  // Drive is counted per UNIQUE place (one round-trip from the base per
  // place visited), not per activity — otherwise two activities at the same
  // town would double-count the drive.
  const dayTotals = (actIds) => {
    let onSite = 0;
    let drive = 0;
    const seenPlaces = new Set();
    actIds.forEach((id) => {
      const a = activityById(id);
      if (!a) return;
      onSite += a.durationMin || 0;
      if (seenPlaces.has(a.placeId)) return;
      seenPlaces.add(a.placeId);
      const d = base?.distances?.[a.placeId];
      if (d) drive += d.min * 2;
    });
    return { onSite, drive };
  };

  // Activities with at least one vote that haven't been scheduled yet —
  // sorted by vote count desc so the most popular bubble up. Votes here
  // are purely informational (they don't drive any cost calc); this section
  // exists so the family notices a popular pick that's drifted off the plan.
  const unscheduledInterest = ACTIVITIES
    .filter((a) => state.isInterested(a.id) && !state.isScheduled(a.id))
    .sort((a, b) => state.voteCount(b.id) - state.voteCount(a.id));
  const unscheduledAll = ACTIVITIES.filter((a) => !state.isScheduled(a.id));

  const updateDragOver = (key) => {
    if (key !== dragOver) setDragOver(key);
  };
  const clearDragOver = (key) => {
    if (key === dragOver) setDragOver(null);
  };

  // Drop handlers.
  const dropOnItem = (e, dayIdx, idx) => {
    e.preventDefault();
    e.stopPropagation();
    const p = readDragPayload(e);
    setDragOver(null);
    if (!p) return;
    state.insertActivity(dayIdx, p.actId, idx);
  };
  const dropOnDay = (e, dayIdx) => {
    e.preventDefault();
    const p = readDragPayload(e);
    setDragOver(null);
    if (!p) return;
    state.insertActivity(dayIdx, p.actId, null);
  };
  const dropOnUnsched = (e) => {
    e.preventDefault();
    const p = readDragPayload(e);
    setDragOver(null);
    if (!p) return;
    state.unassignActivity(p.actId);
  };

  const allowDrop = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ fontFamily: fonts.serif, fontSize: size.isMobile ? "26px" : "32px", color: colors.text, marginBottom: "6px" }}>
        Itinerario
      </h2>
      <p style={{ fontFamily: fonts.sans, fontSize: "14px", color: colors.textMuted, marginBottom: "18px", lineHeight: 1.5 }}>
        {base
          ? `Tiempos de coche calculados desde ${base.name} (${base.town}), ida y vuelta. `
          : "Elige una base para ver los tiempos de coche de cada día. "}
        <span style={{ color: colors.textSubtle }}>
          💡 Arrastra las actividades entre días, o usa <strong>+ Añadir</strong> en cada día.
        </span>
      </p>

      {state.sharedMeta?.itineraryUpdatedBy && (
        <p style={{ fontFamily: fonts.sans, fontSize: size.isMobile ? "11px" : "12px", color: colors.textSubtle, marginBottom: size.isMobile ? "8px" : "12px", lineHeight: 1.4 }}>
          ✏️ {size.isMobile ? "" : "Última edición compartida: "}
          <strong style={{ color: colors.textMuted }}>{state.memberName(state.sharedMeta.itineraryUpdatedBy)}</strong>{" "}
          {relativeTime(state.sharedMeta.itineraryUpdatedAt)}
        </p>
      )}

      <ItineraryWarnings state={state} size={size} />

      <ProfilesBar state={state} size={size} />

      {/* Compare the calendar date (yyyy-mm-dd) so the "Hoy" badge survives
          hours/timezones differences. */}
      <div style={{ display: "grid", gridTemplateColumns: size.isDesktop ? "1fr 1fr" : "1fr", gap: "14px" }}>
        {state.days.map((d, i) => {
          const actIds = state.activitiesOnDay(i);
          const { onSite, drive } = dayTotals(actIds);
          const isDayDragOver = dragOver === `day:${i}`;
          const todayIso = new Date().toISOString().slice(0, 10);
          const isToday = d.toISOString().slice(0, 10) === todayIso;
          let borderColor = colors.border;
          if (isDayDragOver) borderColor = colors.accent;
          else if (isToday) borderColor = colors.success;
          return (
            <section
              key={d.toISOString().slice(0, 10)}
              onDragOver={allowDrop}
              onDragEnter={() => updateDragOver(`day:${i}`)}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) clearDragOver(`day:${i}`); }}
              onDrop={(e) => dropOnDay(e, i)}
              style={{
                background: colors.bgCard,
                border: `2px solid ${borderColor}`,
                borderRadius: radii.lg,
                padding: "16px",
                boxShadow: shadows.sm,
                transition: "border-color 0.12s, background 0.12s",
                ...(isDayDragOver ? { background: colors.accentSoft } : null),
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
                <h3 style={{ fontFamily: fonts.serif, fontSize: "21px", color: colors.text, display: "inline-flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                  <span>Día {i + 1}</span>
                  <span style={{ fontFamily: fonts.sans, fontSize: "13px", color: colors.textMuted, fontWeight: 400 }}>
                    {formatDow(d)}
                  </span>
                  {isToday && (
                    <span style={{ fontFamily: fonts.sans, fontSize: "11px", fontWeight: 700, color: colors.onAccent, background: colors.success, borderRadius: radii.pill, padding: "2px 8px" }}>
                      📍 Hoy
                    </span>
                  )}
                  {(i === 0 || i === state.nights) && base?.fromHome && (
                    <span
                      title={`${base.fromHome.km} km · ~${Math.round(base.fromHome.min / 60 * 10) / 10}h en coche ${i === 0 ? "desde" : "de vuelta a"} casa`}
                      style={{ fontFamily: fonts.sans, fontSize: "11px", fontWeight: 700, color: colors.warningText, background: colors.warningSoft, border: `1px solid ${colors.warning}`, borderRadius: radii.pill, padding: "2px 8px" }}
                    >
                      🚙 {i === 0 ? "Llegada" : "Regreso"} · ~{Math.round(base.fromHome.min / 60)}h coche
                    </span>
                  )}
                </h3>
                {actIds.length > 0 && (
                  <span style={{ fontSize: "11.5px", color: colors.textSubtle, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: drive > 180 ? colors.dangerText : "inherit", fontWeight: drive > 180 ? 700 : 400 }}>
                      🚗 {fmtDur(drive)}{drive > 180 ? " ⚠️" : ""}
                    </span>
                    <span>· ⏱️ {fmtDur(onSite)}</span>
                  </span>
                )}
              </div>

              {actIds.length === 0 ? (
                <p style={{ fontSize: "13px", color: colors.textSubtle, fontStyle: "italic", padding: "8px 0" }}>
                  Día libre. Suelta aquí una actividad o usa «+ Añadir» abajo.
                </p>
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "7px" }}>
                  {actIds.map((id, idx) => {
                    const a = activityById(id);
                    if (!a) return null;
                    const tm = TYPE_META[a.type] || {};
                    const isItemDragOver = dragOver === `item:${i}:${idx}`;
                    const arrowStyle = (disabled) => ({
                      background: "transparent", border: "none",
                      color: disabled ? colors.border : colors.textMuted,
                      cursor: disabled ? "default" : "pointer", fontSize: "12px", lineHeight: 1, padding: "1px 3px",
                    });
                    return (
                      <li
                        key={id}
                        draggable
                        onDragStart={(e) => setDragPayload(e, id)}
                        onDragOver={allowDrop}
                        onDragEnter={(e) => { e.stopPropagation(); updateDragOver(`item:${i}:${idx}`); }}
                        onDragLeave={(e) => { e.stopPropagation(); if (!e.currentTarget.contains(e.relatedTarget)) clearDragOver(`item:${i}:${idx}`); }}
                        onDrop={(e) => dropOnItem(e, i, idx)}
                        style={{
                          display: "flex", alignItems: "center", gap: "9px",
                          background: isItemDragOver ? colors.accentMuted : colors.bgPanel,
                          borderRadius: radii.md, padding: "8px 10px",
                          borderTop: isItemDragOver ? `2px solid ${colors.accent}` : "2px solid transparent",
                          cursor: "grab",
                          transition: "background 0.1s, border-color 0.1s",
                        }}
                      >
                        <span aria-hidden="true" data-print="hide" title="Arrastra para mover" style={{ fontSize: "14px", color: colors.textSubtle, cursor: "grab" }}>⋮⋮</span>
                        <span data-print="hide" style={{ display: "flex", flexDirection: "column" }}>
                          <button type="button" aria-label={`Subir ${a.name}`} disabled={idx === 0} onClick={() => state.moveActivityInDay(i, id, -1)} style={arrowStyle(idx === 0)}>▲</button>
                          <button type="button" aria-label={`Bajar ${a.name}`} disabled={idx === actIds.length - 1} onClick={() => state.moveActivityInDay(i, id, 1)} style={arrowStyle(idx === actIds.length - 1)}>▼</button>
                        </span>
                        <span aria-hidden="true" style={{ fontSize: "16px" }}>{tm.glyph}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13.5px", fontWeight: 600, color: colors.text, display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            <span>{a.name}</span>
                            {a.lowMobilityOk === false && (
                              <span
                                title={a.splitOption ? `Movilidad reducida: ${a.splitOption}` : "No apta para movilidad reducida"}
                                aria-label="No apta para movilidad reducida"
                                style={{ fontSize: "10.5px", fontWeight: 700, color: colors.dangerText, background: colors.dangerSoft, border: `1px solid ${colors.danger}`, borderRadius: radii.pill, padding: "0 6px" }}
                              >
                                ⚠️
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "11.5px", color: colors.textMuted }}>
                            {placeById(a.placeId)?.name} · {fmtDur(a.durationMin)}{a.price > 0 ? ` · ${a.price} €` : ""}
                          </div>
                        </div>
                        <select
                          data-print="hide"
                          aria-label={`Mover ${a.name} a otro día`}
                          value={String(i)}
                          onChange={(e) => state.assignActivity(Number(e.target.value), id)}
                          style={{ background: "transparent", color: colors.textSubtle, border: "none", fontSize: "11.5px", fontFamily: fonts.sans, cursor: "pointer" }}
                          title="Mover a otro día"
                        >
                          {state.days.map((dd, j) => (
                            <option key={j} value={j}>D{j + 1}</option>
                          ))}
                        </select>
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

              {/* + Añadir picker (mobile-friendly alternative to drag) */}
              <div data-print="hide" style={{ marginTop: "10px" }}>
                <select
                  aria-label={`Añadir actividad al día ${i + 1}`}
                  value=""
                  onChange={(e) => {
                    if (e.target.value === "") return;
                    state.assignActivity(i, e.target.value);
                  }}
                  style={{
                    width: "100%",
                    background: colors.bgPanel,
                    color: colors.textBody,
                    border: `1px dashed ${colors.borderStrong}`,
                    borderRadius: radii.md,
                    padding: "7px 10px",
                    fontSize: "12.5px",
                    fontFamily: fonts.sans,
                    cursor: "pointer",
                  }}
                >
                  <option value="">+ Añadir actividad…</option>
                  {unscheduledAll.length === 0 ? (
                    <option value="" disabled>(todas las actividades ya están asignadas)</option>
                  ) : (
                    unscheduledAll.map((a) => (
                      <option key={a.id} value={a.id}>
                        {TYPE_META[a.type]?.glyph || "•"} {a.name} — {placeById(a.placeId)?.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </section>
          );
        })}
      </div>

      {/* Unscheduled interests (also a drop zone: drop here = unassign) */}
      {unscheduledInterest.length > 0 && (
        <section
          onDragOver={allowDrop}
          onDragEnter={() => updateDragOver("unsched")}
          onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) clearDragOver("unsched"); }}
          onDrop={dropOnUnsched}
          style={{
            marginTop: "20px",
            background: dragOver === "unsched" ? colors.accentSoft : colors.bgPanel,
            border: `2px ${dragOver === "unsched" ? "solid" : "dashed"} ${dragOver === "unsched" ? colors.accent : colors.borderStrong}`,
            borderRadius: radii.lg,
            padding: "16px",
            transition: "background 0.12s, border-color 0.12s",
          }}
        >
          <div style={{ fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: colors.accent, fontWeight: 700, marginBottom: "10px" }}>
            ♥ Con votos sin programar ({unscheduledInterest.length})
            <span style={{ marginLeft: "10px", fontSize: "10.5px", color: colors.textSubtle, fontWeight: 500, letterSpacing: "0.5px" }}>
              · ordenadas por votos · suelta una aquí para quitarla de un día
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {unscheduledInterest.map((a) => {
              const tm = TYPE_META[a.type] || {};
              return (
                <div
                  key={a.id}
                  draggable
                  onDragStart={(e) => setDragPayload(e, a.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "9px", flexWrap: "wrap",
                    background: colors.bgCard, border: `1px solid ${colors.border}`,
                    borderRadius: radii.md, padding: "8px 10px", cursor: "grab",
                  }}
                >
                  <span aria-hidden="true" data-print="hide" style={{ color: colors.textSubtle }}>⋮⋮</span>
                  <span aria-hidden="true">{tm.glyph}</span>
                  <span style={{ flex: 1, minWidth: 140, fontSize: "13.5px", color: colors.text }}>
                    {a.name} <span style={{ color: colors.textMuted, fontSize: "12px" }}>· {placeById(a.placeId)?.name}</span>
                  </span>
                  <span
                    title={`${state.voteCount(a.id)} voto${state.voteCount(a.id) === 1 ? "" : "s"}`}
                    style={{
                      background: colors.accentSoft, color: colors.accentHover,
                      border: `1px solid ${colors.accentBorder}`,
                      borderRadius: radii.pill, padding: "1px 8px",
                      fontSize: "11px", fontWeight: 700, fontFamily: fonts.sans,
                    }}
                  >
                    ♥ {state.voteCount(a.id)}
                  </span>
                  <select
                    data-print="hide"
                    aria-label={`Asignar ${a.name} a un día`}
                    defaultValue=""
                    onChange={(e) => e.target.value !== "" && state.assignActivity(Number(e.target.value), a.id)}
                    style={{
                      background: colors.bgPanel, color: colors.textBody, border: `1px solid ${colors.border}`,
                      borderRadius: radii.md, padding: "6px 9px", fontSize: "12.5px", fontFamily: fonts.sans, cursor: "pointer",
                    }}
                  >
                    <option value="">Asignar a…</option>
                    {state.days.map((d, i) => (
                      <option key={d.toISOString().slice(0, 10)} value={i}>Día {i + 1} · {formatDow(d)}</option>
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
