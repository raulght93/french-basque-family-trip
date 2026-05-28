import { useEffect, useRef } from "react";
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

// Sticky horizontal tab bar.
// - Labels are ALWAYS visible (including mobile) so each tab is identifiable
//   at a glance — emoji-only was confusing on phones.
// - Active tab auto-scrolls into view (handy when CTAs from other panels
//   jump to a tab that's offscreen).
// - Edge fade hints there's more to scroll horizontally.
// - Keyboard ←/→ cycles tabs; Home/End jump to first/last.
// - `badges` prop optionally surfaces progress (✓ on base chosen, counts on
//   votes / scheduled activities).
export const ViewSwitcher = ({ active, onChange, size, badges = {} }) => {
  const scrollRef = useRef(null);
  const tabsRef = useRef(new Map());

  // Keep the active tab visible whenever it changes (including swipes that
  // change active programmatically).
  useEffect(() => {
    const el = tabsRef.current.get(active);
    if (el?.scrollIntoView) {
      el.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
  }, [active]);

  const handleKey = (e) => {
    const idx = VIEWS.findIndex((v) => v.id === active);
    if (idx < 0) return;
    if (e.key === "ArrowRight" && idx < VIEWS.length - 1) { e.preventDefault(); onChange(VIEWS[idx + 1].id); }
    else if (e.key === "ArrowLeft" && idx > 0)            { e.preventDefault(); onChange(VIEWS[idx - 1].id); }
    else if (e.key === "Home")                            { e.preventDefault(); onChange(VIEWS[0].id); }
    else if (e.key === "End")                             { e.preventDefault(); onChange(VIEWS[VIEWS.length - 1].id); }
  };

  const wrap = {
    position: "sticky",
    top: 0,
    zIndex: 20,
    background: colors.bgPanel,
    borderBottom: `1px solid ${colors.border}`,
    boxShadow: shadows.sm,
  };
  const fade = (side) => ({
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "24px",
    pointerEvents: "none",
    background: `linear-gradient(to ${side === "left" ? "right" : "left"}, var(--c-bgPanel), transparent)`,
    [side]: 0,
    zIndex: 1,
  });

  return (
    <div style={wrap} data-print="hide">
      <div style={{ position: "relative" }}>
        <span aria-hidden="true" style={fade("left")} />
        <span aria-hidden="true" style={fade("right")} />
        <nav
          ref={scrollRef}
          role="tablist"
          aria-label="Secciones del viaje"
          onKeyDown={handleKey}
          style={{
            display: "flex",
            gap: "4px",
            padding: size.isMobile ? "8px 14px" : "10px 28px",
            overflowX: "auto",
            scrollSnapType: "x proximity",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          {VIEWS.map((v) => {
            const isActive = v.id === active;
            const badge = badges[v.id];
            return (
              <button
                key={v.id}
                ref={(el) => { if (el) tabsRef.current.set(v.id, el); else tabsRef.current.delete(v.id); }}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="fbt-view"
                tabIndex={isActive ? 0 : -1}
                onClick={() => onChange(v.id)}
                style={{
                  flex: "0 0 auto",
                  scrollSnapAlign: "center",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: isActive ? colors.accent : colors.bgCard,
                  color: isActive ? colors.onAccent : colors.textBody,
                  border: `1px solid ${isActive ? colors.accent : colors.border}`,
                  borderRadius: radii.pill,
                  padding: size.isMobile ? "7px 12px" : "8px 16px",
                  fontSize: size.isMobile ? "12.5px" : "13px",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  fontFamily: fonts.sans,
                  whiteSpace: "nowrap",
                  transition: "background 0.15s, color 0.15s, transform 0.12s",
                  transform: isActive ? "translateY(-1px)" : "none",
                  boxShadow: isActive ? shadows.sm : "none",
                }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = shadows.ring; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = isActive ? shadows.sm : "none"; }}
              >
                <span aria-hidden="true">{v.glyph}</span>
                <span>{v.label}</span>
                {badge != null && badge !== "" && (
                  <span
                    aria-label={`${badge} elemento${typeof badge === "number" && badge !== 1 ? "s" : ""}`}
                    style={{
                      marginLeft: "2px",
                      background: isActive ? "rgba(255,255,255,0.22)" : colors.accent,
                      color: isActive ? colors.onAccent : colors.onAccent,
                      borderRadius: radii.pill,
                      padding: "1px 7px",
                      fontSize: "10.5px",
                      fontWeight: 700,
                      lineHeight: 1.4,
                      minWidth: "16px",
                      textAlign: "center",
                    }}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile-only swipe hint, shown when on the first tab. */}
      {size.isMobile && active === "inicio" && (
        <div
          aria-hidden="true"
          style={{
            fontSize: "10.5px",
            color: colors.textSubtle,
            fontFamily: fonts.sans,
            textAlign: "center",
            padding: "0 0 6px",
            letterSpacing: "0.3px",
          }}
        >
          ⇠ desliza las pestañas ⇢
        </div>
      )}
    </div>
  );
};

export default ViewSwitcher;
