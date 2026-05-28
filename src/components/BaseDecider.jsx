import { useMemo } from "react";
import { colors, fonts, radii, shadows } from "../styles/tokens.js";
import { BASES } from "../data/bases.js";
import { PLACES, ZONE_LABEL } from "../data/places.js";
import { activitiesForPlace } from "../data/activities.js";
import { daysUntil, deadlineLevel } from "../utils/dates.js";
import { MemberBar } from "./MemberBar.jsx";

const fmtMin = (min) => {
  if (min == null) return "—";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
};

const DEADLINE_PALETTE = {
  past:   { bg: colors.dangerSoft,  fg: colors.dangerText },
  soon:   { bg: colors.warningSoft, fg: colors.warningText },
  future: { bg: colors.successSoft, fg: colors.successText },
};
const deadlineText = (d) => {
  if (d < 0) return `Venció hace ${-d} d`;
  if (d === 0) return "¡Hoy!";
  return `${d} días`;
};
const DeadlineChip = ({ iso, label }) => {
  const d = daysUntil(iso);
  const { bg, fg } = DEADLINE_PALETTE[deadlineLevel(iso)];
  return (
    <span style={{ background: bg, color: fg, borderRadius: radii.pill, padding: "2px 9px", fontSize: "11.5px", fontWeight: 700 }}>
      {label}: {deadlineText(d)}
    </span>
  );
};

export const BaseDecider = ({ state, size }) => {
  const { isInterested, toggleVote, hasVoted, activeMemberId } = state;

  const placesWithActivities = useMemo(
    () => PLACES.filter((p) => activitiesForPlace(p.id).length > 0),
    [],
  );

  // Chip "on" = the active voter has voted for at least one activity there.
  const placeVotedByActive = (placeId) =>
    activitiesForPlace(placeId).some((a) => hasVoted(a.id, activeMemberId));
  const togglePlace = (placeId) => {
    const acts = activitiesForPlace(placeId);
    const anyOn = acts.some((a) => hasVoted(a.id, activeMemberId));
    acts.forEach((a) => {
      const on = hasVoted(a.id, activeMemberId);
      if (anyOn && on) toggleVote(a.id, activeMemberId);
      if (!anyOn && !on) toggleVote(a.id, activeMemberId);
    });
  };
  // Distinct voters across a place's activities (any member).
  const placeVoters = (placeId) => {
    const s = new Set();
    activitiesForPlace(placeId).forEach((a) => state.votersOf(a.id).forEach((v) => s.add(v)));
    return s.size;
  };

  // Score uses places anyone is interested in; fallback to all if no votes.
  const anyInterest = placesWithActivities.some((p) =>
    activitiesForPlace(p.id).some((a) => isInterested(a.id)),
  );
  const considered = placesWithActivities.filter((p) =>
    anyInterest ? activitiesForPlace(p.id).some((a) => isInterested(a.id)) : true,
  );

  const scored = BASES.map((base) => {
    const legs = considered.map((p) => ({ place: p, d: base.distances[p.id] || null }));
    const totalMin = legs.reduce((s, l) => s + (l.d?.min || 0), 0);
    const totalKm = legs.reduce((s, l) => s + (l.d?.km || 0), 0);
    return { base, legs, totalMin, totalKm };
  });
  const bestMin = Math.min(...scored.map((s) => s.totalMin));

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ fontFamily: fonts.serif, fontSize: size.isMobile ? "26px" : "32px", color: colors.text, marginBottom: "6px" }}>
        ¿Dónde nos alojamos?
      </h2>
      <p style={{ fontFamily: fonts.sans, fontSize: "14px", color: colors.textMuted, lineHeight: 1.55, marginBottom: "16px" }}>
        Urruti (Zilbeti, España) está descartada. Quedan <strong>Maison</strong> en Sare y{" "}
        <strong>Chez Lucas</strong> en Mendiondo. Cada uno vota lo que le interesa y la app calcula
        qué base os deja más cerca.
      </p>

      <div style={{ marginBottom: "16px" }}>
        <MemberBar state={state} />
      </div>

      {/* Interest selector by place */}
      <section
        style={{
          background: colors.bgPanel,
          border: `1px solid ${colors.border}`,
          borderRadius: radii.lg,
          padding: size.isMobile ? "14px" : "18px",
          marginBottom: "20px",
        }}
      >
        <div style={{ fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: colors.accent, fontWeight: 700, marginBottom: "10px" }}>
          ¿Qué os interesa visitar?
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {placesWithActivities.map((p) => {
            const on = placeVotedByActive(p.id);
            const voters = placeVoters(p.id);
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={on}
                onClick={() => togglePlace(p.id)}
                style={{
                  background: on ? colors.accent : colors.bgCard,
                  color: on ? colors.onAccent : colors.textBody,
                  border: `1px solid ${on ? colors.accent : colors.border}`,
                  borderRadius: radii.pill,
                  padding: "7px 13px",
                  fontSize: "13px",
                  fontWeight: on ? 700 : 500,
                  cursor: "pointer",
                  fontFamily: fonts.sans,
                }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = shadows.ring; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
              >
                {on ? "✓ " : ""}{p.name}
                <span style={{ opacity: 0.7, fontSize: "11px", marginLeft: "5px" }}>{ZONE_LABEL[p.zone]}</span>
                {voters > 0 && (
                  <span style={{ marginLeft: "5px", fontSize: "11px", fontWeight: 700, opacity: on ? 0.9 : 0.65 }}>· {voters}👤</span>
                )}
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: "12px", color: colors.textSubtle, marginTop: "10px", fontStyle: "italic" }}>
          {anyInterest
            ? `Comparando con ${considered.length} destino(s) con votos. El número 👤 son los votantes de cada sitio.`
            : "Sin votos se comparan todos los destinos. Votad los que os importen para afinar."}
        </p>
      </section>

      {/* Base comparison cards */}
      <div style={{ display: "grid", gridTemplateColumns: size.isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
        {scored.map(({ base, legs, totalMin, totalKm }) => {
          const isChosen = state.baseId === base.id;
          const isBest = totalMin === bestMin && scored.length > 1;
          let borderColor = colors.border;
          if (isChosen) borderColor = colors.accent;
          else if (isBest) borderColor = colors.green;
          return (
            <article
              key={base.id}
              style={{
                background: colors.bgCard,
                border: `2px solid ${borderColor}`,
                borderRadius: radii.lg,
                padding: size.isMobile ? "16px" : "20px",
                boxShadow: shadows.sm,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
                <div>
                  <h3 style={{ fontFamily: fonts.serif, fontSize: "24px", color: colors.text, lineHeight: 1.1 }}>{base.name}</h3>
                  <div style={{ fontSize: "13px", color: colors.textMuted, fontFamily: fonts.sans }}>{base.town} · Francia</div>
                </div>
                {isBest && (
                  <span style={{ background: colors.greenSoft, color: colors.green, borderRadius: radii.pill, padding: "3px 10px", fontSize: "11.5px", fontWeight: 700 }}>
                    ⭐ Más céntrica
                  </span>
                )}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                <span style={{
                  background: base.status === "reserved" ? colors.successSoft : colors.bgPanel,
                  color: base.status === "reserved" ? colors.successText : colors.textMuted,
                  borderRadius: radii.pill, padding: "2px 9px", fontSize: "11.5px", fontWeight: 700,
                }}>
                  {base.status === "reserved" ? "✓ Reservada" : "○ Sin reservar"}
                </span>
                <DeadlineChip iso={base.bookingDeadline} label={base.status === "reserved" ? "Cancela en" : "Decide en"} />
                {base.payNow && (
                  <span style={{ background: colors.warningSoft, color: colors.warningText, borderRadius: radii.pill, padding: "2px 9px", fontSize: "11.5px", fontWeight: 700 }}>
                    💳 Se paga ahora
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: "18px", padding: "10px 0", borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
                <div>
                  <div style={{ fontSize: "26px", fontWeight: 700, color: colors.accent, fontFamily: fonts.sans, lineHeight: 1 }}>{fmtMin(totalMin)}</div>
                  <div style={{ fontSize: "11.5px", color: colors.textSubtle }}>conducción total*</div>
                </div>
                <div>
                  <div style={{ fontSize: "26px", fontWeight: 700, color: colors.text, fontFamily: fonts.sans, lineHeight: 1 }}>{totalKm} km</div>
                  <div style={{ fontSize: "11.5px", color: colors.textSubtle }}>suma de trayectos*</div>
                </div>
              </div>

              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "3px" }}>
                {legs.map(({ place, d }) => (
                  <li key={place.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", fontFamily: fonts.sans, color: colors.textBody }}>
                    <span>{place.name}{d?.est ? " ~" : ""}</span>
                    <span style={{ color: colors.textMuted }}>{d ? `${d.km} km · ${fmtMin(d.min)}` : "—"}</span>
                  </li>
                ))}
              </ul>

              <div style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.5 }}>{base.notes}</div>
              <div style={{ fontSize: "12px", color: colors.textSubtle }}>🚗 Desde casa: {base.fromHome.km} km · {fmtMin(base.fromHome.min)}</div>

              <button
                type="button"
                onClick={() => state.setBaseId(isChosen ? null : base.id)}
                style={{
                  marginTop: "auto",
                  background: isChosen ? colors.green : colors.accent,
                  color: colors.onAccent,
                  border: "none",
                  borderRadius: radii.md,
                  padding: "10px 14px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: fonts.sans,
                }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = shadows.ring; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
              >
                {isChosen ? "✓ Base elegida" : "Elegir esta base"}
              </button>
            </article>
          );
        })}
      </div>

      <p style={{ fontSize: "11.5px", color: colors.textSubtle, marginTop: "12px", fontStyle: "italic" }}>
        * Suma de trayectos de ida a cada destino con votos (una visita por destino). Los valores con «~» son
        estimados; el resto vienen de la tabla de la propuesta.
      </p>
    </div>
  );
};

export default BaseDecider;
