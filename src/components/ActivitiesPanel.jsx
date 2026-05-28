import { useMemo, useState } from "react";
import { colors, fonts, radii, shadows } from "../styles/tokens.js";
import { ACTIVITIES, TYPE_META, ACCESS_META } from "../data/activities.js";
import { placeById, ZONE_LABEL } from "../data/places.js";
import { formatDow } from "../utils/dates.js";
import { Img } from "./Img.jsx";
import { MemberBar } from "./MemberBar.jsx";

const Chip = ({ children, bg, fg }) => (
  <span style={{ background: bg, color: fg, borderRadius: radii.pill, padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>
    {children}
  </span>
);

const SELECT_STYLE = {
  background: colors.bgCard,
  color: colors.textBody,
  border: `1px solid ${colors.border}`,
  borderRadius: radii.md,
  padding: "7px 10px",
  fontSize: "13px",
  fontFamily: fonts.sans,
  cursor: "pointer",
};

export const ActivitiesPanel = ({ state, size }) => {
  const [zone, setZone] = useState("all");
  const [access, setAccess] = useState("all");
  const [onlyBooking, setOnlyBooking] = useState(false);
  const [onlyVoted, setOnlyVoted] = useState(false);

  const filtered = useMemo(
    () =>
      ACTIVITIES.filter((a) => {
        const place = placeById(a.placeId);
        if (zone !== "all" && place?.zone !== zone) return false;
        if (access === "noNone" && a.access === "none") return false;
        if (access === "fullOnly" && a.access !== "full") return false;
        if (onlyBooking && !a.booking) return false;
        if (onlyVoted && !state.isInterested(a.id)) return false;
        return true;
      }),
    [zone, access, onlyBooking, onlyVoted, state.votes],
  );

  const votedCount = ACTIVITIES.filter((a) => state.isInterested(a.id)).length;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ fontFamily: fonts.serif, fontSize: size.isMobile ? "26px" : "32px", color: colors.text, marginBottom: "6px" }}>
        Actividades
      </h2>
      <p style={{ fontFamily: fonts.sans, fontSize: "14px", color: colors.textMuted, marginBottom: "14px", lineHeight: 1.5 }}>
        Cada uno marca su voto (alimenta el comparador de bases y el presupuesto) y se asigna a un día.
        {votedCount > 0 && <strong> {votedCount} con votos.</strong>}
      </p>

      <div style={{ marginBottom: "16px" }}>
        <MemberBar state={state} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "18px", alignItems: "center" }}>
        <select aria-label="Filtrar por zona" value={zone} onChange={(e) => setZone(e.target.value)} style={SELECT_STYLE}>
          <option value="all">Toda zona</option>
          <option value="montana">Montaña</option>
          <option value="costa">Costa</option>
          <option value="navarra">Navarra (Xareta)</option>
        </select>
        <select aria-label="Filtrar por accesibilidad" value={access} onChange={(e) => setAccess(e.target.value)} style={SELECT_STYLE}>
          <option value="all">Cualquier accesibilidad</option>
          <option value="noNone">♿ Evitar no accesibles</option>
          <option value="fullOnly">♿ Solo totalmente accesibles</option>
        </select>
        {[
          { on: onlyBooking, set: setOnlyBooking, label: "📞 Requiere reserva" },
          { on: onlyVoted, set: setOnlyVoted, label: "♥ Solo votadas" },
        ].map((t) => (
          <button
            key={t.label}
            type="button"
            aria-pressed={t.on}
            onClick={() => t.set((x) => !x)}
            style={{
              background: t.on ? colors.accent : colors.bgCard,
              color: t.on ? colors.onAccent : colors.textBody,
              border: `1px solid ${t.on ? colors.accent : colors.border}`,
              borderRadius: radii.pill,
              padding: "7px 13px",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: fonts.sans,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: size.isMobile ? "1fr" : size.isDesktop ? "1fr 1fr" : "1fr", gap: "14px" }}>
        {filtered.map((a) => {
          const place = placeById(a.placeId);
          const tm = TYPE_META[a.type] || {};
          const am = ACCESS_META[a.access] || {};
          const interested = state.isInterested(a.id);
          const scheduledDay = state.dayOfActivity(a.id);
          const img = a.img || place?.img;
          return (
            <article
              key={a.id}
              style={{
                background: colors.bgCard,
                border: `1px solid ${interested ? colors.accent : colors.border}`,
                borderRadius: radii.lg,
                boxShadow: shadows.sm,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div style={{ height: "140px", position: "relative" }}>
                <Img src={img} alt={a.name} zone={place?.zone} caption={`${a.name} — ${a.desc}`} />
                <span style={{
                  position: "absolute", top: "8px", right: "8px",
                  background: a.price > 0 ? colors.accent : colors.green,
                  color: colors.onAccent, borderRadius: radii.pill, padding: "3px 10px",
                  fontSize: "12.5px", fontWeight: 700, boxShadow: shadows.sm,
                }}>
                  {a.price > 0 ? `${a.price} €` : "Gratis"}
                </span>
              </div>

              <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: "9px", flex: 1 }}>
                <div>
                  <div style={{ fontFamily: fonts.serif, fontSize: "19px", color: colors.text, lineHeight: 1.15 }}>
                    <span style={{ marginRight: "6px" }} aria-hidden="true">{tm.glyph}</span>{a.name}
                  </div>
                  <div style={{ fontSize: "12.5px", color: colors.textMuted, marginTop: "2px" }}>
                    {place?.name} · {ZONE_LABEL[place?.zone]}
                  </div>
                </div>

                <p style={{ fontSize: "13px", color: colors.textBody, lineHeight: 1.5, margin: 0 }}>{a.desc}</p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  <Chip bg={colors.bgPanel} fg={colors.textMuted}>🕐 {a.hours}</Chip>
                  <Chip bg={colors.bgPanel} fg={colors.textMuted}>⏱️ {a.durationMin >= 60 ? `${Math.round((a.durationMin / 60) * 10) / 10} h` : `${a.durationMin} min`}</Chip>
                  <Chip
                    bg={am.color === "success" ? colors.successSoft : am.color === "warning" ? colors.warningSoft : colors.dangerSoft}
                    fg={am.color === "success" ? colors.successText : am.color === "warning" ? colors.warningText : colors.dangerText}
                  >
                    {am.glyph} {am.label}
                  </Chip>
                  {a.booking && <Chip bg={colors.warningSoft} fg={colors.warningText}>📞 Reservar</Chip>}
                </div>

                {a.accessNote && (
                  <div style={{ fontSize: "12px", color: colors.textSubtle, lineHeight: 1.45, fontStyle: "italic" }}>{a.accessNote}</div>
                )}
                {a.bookingNote && (
                  <div style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.45 }}>ℹ️ {a.bookingNote}</div>
                )}

                {/* Per-member votes */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", paddingTop: "2px" }}>
                  <span style={{ fontSize: "11.5px", color: colors.textMuted, fontWeight: 600 }}>Votos:</span>
                  {state.members.map((m) => {
                    const voted = state.hasVoted(a.id, m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        aria-pressed={voted}
                        aria-label={`${voted ? "Quitar voto de" : "Votar como"} ${m.name}`}
                        onClick={() => state.toggleVote(a.id, m.id)}
                        style={{
                          background: voted ? colors.accent : "transparent",
                          color: voted ? colors.onAccent : colors.accent,
                          border: `1px solid ${colors.accent}`,
                          borderRadius: radii.pill,
                          padding: "4px 11px",
                          fontSize: "12px",
                          fontWeight: voted ? 700 : 500,
                          cursor: "pointer",
                          fontFamily: fonts.sans,
                        }}
                      >
                        {voted ? "♥ " : "♡ "}{m.name}
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginTop: "auto", paddingTop: "4px" }}>
                  <select
                    aria-label={`Asignar ${a.name} a un día`}
                    value={scheduledDay == null ? "" : String(scheduledDay)}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") state.unassignActivity(a.id);
                      else state.assignActivity(Number(v), a.id);
                    }}
                    style={{ ...SELECT_STYLE, fontSize: "12.5px", padding: "7px 9px", width: "100%" }}
                  >
                    <option value="">📅 Sin día asignado</option>
                    {state.days.map((d, i) => (
                      <option key={i} value={i}>Día {i + 1} · {formatDow(d)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p style={{ fontFamily: fonts.sans, color: colors.textSubtle, textAlign: "center", padding: "40px 0" }}>
          No hay actividades con esos filtros.
        </p>
      )}
    </div>
  );
};

export default ActivitiesPanel;
