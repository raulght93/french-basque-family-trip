import { colors, fonts, radii } from "../styles/tokens.js";
import { formatDate } from "../utils/dates.js";
import { baseById } from "../data/bases.js";

const NightStepper = ({ nights, setNights }) => (
  <span
    data-print="hide"
    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
  >
    🌙
    <button
      type="button"
      aria-label="Una noche menos"
      onClick={() => setNights(Math.max(1, nights - 1))}
      style={miniBtn}
    >−</button>
    <span style={{ minWidth: "62px", textAlign: "center" }}>{nights} noches</span>
    <button
      type="button"
      aria-label="Una noche más"
      onClick={() => setNights(Math.min(30, nights + 1))}
      style={miniBtn}
    >+</button>
  </span>
);

const miniBtn = {
  width: "22px",
  height: "22px",
  borderRadius: radii.sm,
  background: colors.overlayOnDarkMed,
  border: `1px solid ${colors.overlayOnDarkMed}`,
  color: colors.textOnDark,
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
  lineHeight: 1,
};

// Top banner: fixed trip name + a one-line dates/base summary with an inline
// nights shortcut (so days can be tweaked without going to the budget view).
export const Header = ({ state, size }) => {
  const base = baseById(state.baseId);

  return (
    <header
      style={{
        background: colors.bgDark,
        color: colors.textOnDark,
        padding: size.isMobile ? "20px 16px 18px" : "30px 28px 24px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            color: colors.accentMuted,
            fontWeight: 600,
            marginBottom: "6px",
          }}
        >
          🏔️ País Vasco Francés · Viaje en familia
        </div>

        <h1
          style={{
            fontFamily: fonts.serif,
            fontSize: size.isMobile ? "30px" : "44px",
            fontWeight: 700,
            color: colors.textOnDark,
            lineHeight: 1.05,
            margin: 0,
          }}
        >
          {state.tripName}
        </h1>

        <div
          style={{
            marginTop: "12px",
            display: "flex",
            flexWrap: "wrap",
            gap: "10px 16px",
            alignItems: "center",
            fontFamily: fonts.sans,
            fontSize: "13.5px",
            color: colors.textOnDarkMuted,
          }}
        >
          <span>📅 {formatDate(state.startDate)} → {formatDate(state.endDate)}</span>
          <NightStepper nights={state.nights} setNights={state.setNights} />
          <span>🏠 {base ? `${base.name} · ${base.town}` : "Base sin decidir"}</span>
          <span>👥 {state.travelers}{state.cars > 1 ? ` · 🚗 ${state.cars}` : ""}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
