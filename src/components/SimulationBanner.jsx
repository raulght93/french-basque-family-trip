import { colors, fonts, radii } from "../styles/tokens.js";

// Visible only while state.simulationMode is true. Communicates clearly that
// changes to the BASE and ITINERARY are local-only and offers two exits:
//   • Compartir con la familia  — keep your local changes and let them sync.
//   • Volver al plan compartido — discard local; pull remote and adopt it.
//
// Votes and comments continue to sync normally during simulation — only the
// shared day-plan is sandboxed.
export const SimulationBanner = ({ state, onShare, onDiscard }) => {
  if (!state.simulationMode) return null;
  return (
    <div
      data-print="hide"
      role="status"
      style={{
        background: colors.warningSoft,
        border: `1px solid ${colors.warning}`,
        borderTop: `3px solid ${colors.warning}`,
        padding: "10px 16px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "10px 14px",
        fontFamily: fonts.sans,
        position: "sticky",
        top: 0,
        zIndex: 25,
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      }}
    >
      <span style={{ fontSize: "13px", color: colors.warningText, fontWeight: 700 }}>
        🔬 Modo simulación
      </span>
      <span style={{ flex: 1, minWidth: 180, fontSize: "12.5px", color: colors.text, lineHeight: 1.4 }}>
        Estás probando una base y un itinerario solo en tu navegador. La familia no los ve hasta que pulses «Compartir».
      </span>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onShare}
          style={{
            background: colors.accent,
            color: colors.onAccent,
            border: "none",
            borderRadius: radii.pill,
            padding: "6px 14px",
            fontSize: "12.5px",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: fonts.sans,
          }}
        >
          ✓ Compartir con la familia
        </button>
        <button
          type="button"
          onClick={onDiscard}
          style={{
            background: "transparent",
            color: colors.warningText,
            border: `1px solid ${colors.warning}`,
            borderRadius: radii.pill,
            padding: "6px 14px",
            fontSize: "12.5px",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: fonts.sans,
          }}
        >
          ↩ Descartar y volver
        </button>
      </div>
    </div>
  );
};

export default SimulationBanner;
