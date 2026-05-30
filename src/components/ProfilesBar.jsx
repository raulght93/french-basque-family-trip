import { useState } from "react";
import { colors, fonts, radii, shadows } from "../styles/tokens.js";
import { PROFILES } from "../data/profiles.js";
import { baseById } from "../data/bases.js";
import { ConfirmDialog } from "./ConfirmDialog.jsx";

// Quick-start plans. Applying one OVERWRITES the shared trip state:
//   • the base everyone sees,
//   • the family itinerary (last-write-wins on KV),
//   • the local view of votes (others' votes come back on the next GET
//     because of per-member merge, but your own get replaced).
// We surface that explicitly with a ConfirmDialog listing the impact.
export const ProfilesBar = ({ state, size }) => {
  const [pending, setPending] = useState(null);
  const [asSimulation, setAsSimulation] = useState(true);

  const ask = (p) => { setAsSimulation(true); setPending(p); };
  const confirm = () => {
    if (!pending) return;
    state.setSimulationMode(asSimulation);
    state.applyProfile(pending);
    setPending(null);
  };
  const cancel = () => setPending(null);

  // Snapshot of what's about to be overwritten — shown to the user inside
  // the confirmation modal so they decide with eyes open.
  const impactDetails = () => {
    if (!pending) return [];
    const currentBase = baseById(state.baseId);
    const dayCount = Object.values(state.itinerary || {}).filter((l) => l?.length).length;
    const totalActs = Object.values(state.itinerary || {}).reduce((s, l) => s + (l?.length || 0), 0);
    const sharedBy = state.sharedMeta?.itineraryUpdatedBy
      ? `(última edición de ${state.memberName(state.sharedMeta.itineraryUpdatedBy)})`
      : "";
    const sugBase = baseById(pending.base);
    const scopeNote = asSimulation
      ? "Solo en tu navegador (modo simulación): la familia no lo verá hasta que pulses «Compartir»."
      : "Se aplica al grupo: la familia verá el cambio inmediatamente.";
    return [
      scopeNote,
      currentBase
        ? `Base actual «${currentBase.name} · ${currentBase.town}» → «${sugBase?.name} · ${sugBase?.town}».`
        : `Se elegirá «${sugBase?.name} · ${sugBase?.town}» como base.`,
      dayCount > 0
        ? `Itinerario actual (${totalActs} actividades en ${dayCount} días) ${sharedBy} se sustituye por el del plan.`
        : "El itinerario del plan reemplaza al vacío actual.",
      "Los votos NO se tocan — puedes probar planes sin perder lo que ya ha votado nadie.",
    ];
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
        Carga un itinerario de prueba (base + días + votos). Sustituye lo que ya tengas — la app te pedirá confirmación.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: size.isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
        {PROFILES.map((p) => {
          const base = baseById(p.base);
          return (
            <div
              key={p.id}
              style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
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
                onClick={() => ask(p)}
                style={{
                  marginTop: "4px",
                  alignSelf: "flex-start",
                  background: "transparent",
                  color: colors.accent,
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
                Probar este plan
              </button>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!pending}
        danger={!asSimulation}
        title={pending ? `Aplicar «${pending.name}»` : ""}
        message={asSimulation
          ? "El plan se cargará solo en tu navegador para que lo pruebes."
          : "Este plan sustituye la base y el itinerario del viaje compartido. Se sincroniza inmediatamente con el resto de la familia."}
        details={impactDetails()}
        confirmLabel={asSimulation ? "Probar en local" : "Sí, aplicar al grupo"}
        cancelLabel="Cancelar"
        onConfirm={confirm}
        onCancel={cancel}
        extra={
          pending ? (
            <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: colors.textBody, fontFamily: fonts.sans, marginTop: "4px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={asSimulation}
                onChange={(e) => setAsSimulation(e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: colors.accent, cursor: "pointer" }}
              />
              🔬 Probar en local sin tocar el plan compartido (modo simulación)
            </label>
          ) : null
        }
      />
    </section>
  );
};

export default ProfilesBar;
