import { useMemo, useState } from "react";
import { colors, fonts, radii } from "../styles/tokens.js";
import { formatDate, formatDateShort } from "../utils/dates.js";
import { baseById } from "../data/bases.js";
import { computeTripAlerts, sortedAlerts } from "../utils/tripAlerts.js";
import { IdentityModal } from "./IdentityModal.jsx";
import { TripStatus } from "./TripStatus.jsx";
import { AlertsPill } from "./AlertsPill.jsx";

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

const NightStepper = ({ nights, setNights }) => (
  <span data-print="hide" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
    <span aria-hidden="true">🌙</span>
    <button type="button" aria-label="Una noche menos" onClick={() => setNights(Math.max(1, nights - 1))} style={miniBtn}>−</button>
    <span style={{ minWidth: "62px", textAlign: "center" }}>{nights} noches</span>
    <button type="button" aria-label="Una noche más" onClick={() => setNights(Math.min(30, nights + 1))} style={miniBtn}>+</button>
  </span>
);

// Identity chip in the header: tap to open the IdentityModal. Always visible
// (even on mobile) so handing the phone to another family member is one tap.
const IdentityChip = ({ state }) => {
  const [open, setOpen] = useState(false);
  const name = state.selfMemberId ? state.memberName(state.selfMemberId) : "Elegir";
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-print="hide"
        aria-label={state.selfMemberId ? `Eres ${name}. Cambiar de participante.` : "Elegir quién eres"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: colors.overlayOnDarkMed,
          color: colors.textOnDark,
          border: `1px solid ${colors.overlayOnDarkMed}`,
          borderRadius: radii.pill,
          padding: "4px 10px 4px 8px",
          fontSize: "12.5px",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: fonts.sans,
          whiteSpace: "nowrap",
        }}
      >
        <span aria-hidden="true">👤</span>
        <span>{name}</span>
        <span aria-hidden="true" style={{ color: colors.accentMuted, fontSize: "12px" }}>✎</span>
      </button>
      <IdentityModal
        open={open}
        currentId={state.selfMemberId}
        onCancel={state.selfMemberId ? () => setOpen(false) : undefined}
        onPick={(id) => { state.setSelfMemberId(id); setOpen(false); }}
      />
    </>
  );
};

// Top banner: fixed trip name + a one-line dates/base/identity summary.
// The identity chip is here (not buried in a panel) so changing user from
// any view — including handing the phone around — is one tap away.
export const Header = ({ state, size }) => {
  const base = baseById(state.baseId);
  const dates = size.isMobile
    ? `${formatDateShort(state.startDate)} → ${formatDateShort(state.endDate)}`
    : `${formatDate(state.startDate)} → ${formatDate(state.endDate)}`;
  let baseLabel = "Base sin decidir";
  if (base) baseLabel = size.isMobile ? base.name : `${base.name} · ${base.town}`;

  const today = useMemo(() => new Date(), []);
  // Recomputed when the underlying state changes (votes/itinerary/base etc.
  // — the relevant data sources of computeTripAlerts).
  const alerts = useMemo(
    () => sortedAlerts(computeTripAlerts(state)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.baseId, state.itinerary, state.selfMemberId, state.startDateISO, state.nights],
  );

  return (
    <header
      style={{
        background: colors.bgDark,
        color: colors.textOnDark,
        padding: size.isMobile ? "18px 16px 14px" : "30px 28px 22px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "6px" }}>
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              color: colors.accentMuted,
              fontWeight: 600,
            }}
          >
            🏔️ País Vasco Francés
            {size.isMobile ? "" : " · Viaje en familia"}
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <AlertsPill alerts={alerts} size={size} />
            <IdentityChip state={state} />
          </div>
        </div>

        <h1
          style={{
            fontFamily: fonts.serif,
            fontSize: size.isMobile ? "26px" : "44px",
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
            marginTop: size.isMobile ? "10px" : "12px",
            display: "flex",
            flexWrap: "wrap",
            gap: size.isMobile ? "6px 12px" : "10px 16px",
            alignItems: "center",
            fontFamily: fonts.sans,
            fontSize: size.isMobile ? "12.5px" : "13.5px",
            color: colors.textOnDarkMuted,
          }}
        >
          <span>📅 {dates}</span>
          <TripStatus state={state} size={size} today={today} />
          <NightStepper nights={state.nights} setNights={state.setNights} />
          <span>🏠 {baseLabel}</span>
          {!size.isMobile && (
            <span>👥 {state.travelers} · 🚗 {state.cars}</span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
