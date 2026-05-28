import { colors, fonts, radii, shadows } from "../styles/tokens.js";

export const VIEWS = [
  { id: "inicio", glyph: "👋", label: "Inicio" },
  { id: "decidir", glyph: "🏠", label: "Decidir base" },
  { id: "mapa", glyph: "🗺️", label: "Mapa" },
  { id: "actividades", glyph: "🎫", label: "Actividades" },
  { id: "itinerario", glyph: "📅", label: "Itinerario" },
  { id: "checklist", glyph: "✅", label: "Checklist" },
  { id: "presupuesto", glyph: "💶", label: "Presupuesto" },
];

// Sticky tab bar. Horizontal scroll on mobile.
export const ViewSwitcher = ({ active, onChange, size }) => (
  <nav
    data-print="hide"
    role="tablist"
    aria-label="Secciones del viaje"
    style={{
      position: "sticky",
      top: 0,
      zIndex: 20,
      background: colors.bgPanel,
      borderBottom: `1px solid ${colors.border}`,
      display: "flex",
      gap: "4px",
      padding: size.isMobile ? "6px 10px" : "8px 28px",
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",
    }}
  >
    {VIEWS.map((v) => {
      const isActive = v.id === active;
      return (
        <button
          key={v.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(v.id)}
          style={{
            flex: "0 0 auto",
            background: isActive ? colors.accent : "transparent",
            color: isActive ? colors.onAccent : colors.textBody,
            border: `1px solid ${isActive ? colors.accent : "transparent"}`,
            borderRadius: radii.pill,
            padding: size.isMobile ? "7px 12px" : "8px 16px",
            fontSize: "13px",
            fontWeight: isActive ? 700 : 500,
            cursor: "pointer",
            fontFamily: fonts.sans,
            whiteSpace: "nowrap",
            transition: "background 0.15s, color 0.15s",
          }}
          onFocus={(e) => { e.currentTarget.style.boxShadow = shadows.ring; }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
        >
          <span aria-hidden="true" style={{ marginRight: "5px" }}>{v.glyph}</span>
          {size.isMobile ? (isActive ? v.label : "") : v.label}
        </button>
      );
    })}
  </nav>
);

export default ViewSwitcher;
