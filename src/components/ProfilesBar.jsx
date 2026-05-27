import { useState } from "react";
import { colors, fonts, radii, shadows } from "../styles/tokens.js";
import { PROFILES } from "../data/profiles.js";
import { baseById } from "../data/bases.js";

// Quick-start plans. Applying one replaces the current votes + itinerary, so
// we ask for a one-tap confirm before overwriting.
export const ProfilesBar = ({ state, size }) => {
  const [confirmId, setConfirmId] = useState(null);

  const apply = (p) => {
    if (confirmId !== p.id) {
      setConfirmId(p.id);
      setTimeout(() => setConfirmId((c) => (c === p.id ? null : c)), 3500);
      return;
    }
    setConfirmId(null);
    state.applyProfile(p);
  };

  return (
    <section
      data-print="hide"
      style={{
        background: colors.bgPanel,
        border: `1px solid ${colors.border}`,
        borderRadius: radii.lg,
        padding: size.isMobile ? "14px" : "16px 18px",
        marginBottom: "20px",
      }}
    >
      <div style={{ fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: colors.accent, fontWeight: 700, marginBottom: "4px" }}>
        ⚡ Planes rápidos
      </div>
      <p style={{ fontSize: "12.5px", color: colors.textSubtle, margin: "0 0 12px", lineHeight: 1.45 }}>
        Carga un itinerario de prueba (base + días + votos de todos). Luego ajústalo a mano.
        <em> Sustituye tu plan actual.</em>
      </p>
      <div style={{ display: "grid", gridTemplateColumns: size.isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
        {PROFILES.map((p) => {
          const base = baseById(p.base);
          const armed = confirmId === p.id;
          return (
            <div
              key={p.id}
              style={{
                background: colors.bgCard,
                border: `1px solid ${armed ? colors.accent : colors.border}`,
                borderRadius: radii.md,
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ fontSize: "14.5px", fontWeight: 700, color: colors.text }}>
                <span style={{ marginRight: "6px" }} aria-hidden="true">{p.glyph}</span>{p.name}
              </div>
              <div style={{ fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.45 }}>{p.desc}</div>
              <div style={{ fontSize: "11.5px", color: colors.textSubtle }}>🏠 Base sugerida: {base?.name} · {base?.town}</div>
              <button
                type="button"
                onClick={() => apply(p)}
                style={{
                  marginTop: "4px",
                  alignSelf: "flex-start",
                  background: armed ? colors.accent : "transparent",
                  color: armed ? colors.onAccent : colors.accent,
                  border: `1px solid ${colors.accent}`,
                  borderRadius: radii.pill,
                  padding: "6px 14px",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: fonts.sans,
                }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = shadows.ring; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
              >
                {armed ? "⚠️ Confirmar (sustituye)" : "Probar este plan"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProfilesBar;
