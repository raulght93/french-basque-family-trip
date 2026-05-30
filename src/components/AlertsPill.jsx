import { useState } from "react";
import { colors, fonts, radii, shadows } from "../styles/tokens.js";

// Header pill that surfaces all currently-active trip alerts (computed by
// utils/tripAlerts.js). Closed: "⚠ 2 avisos"; open: a small dropdown
// listing each with severity, icon, title and optional detail.
export const AlertsPill = ({ alerts, size }) => {
  const [open, setOpen] = useState(false);
  if (!alerts || alerts.length === 0) return null;
  const warnCount = alerts.filter((a) => a.severity === "warn").length;
  const accent = warnCount > 0 ? colors.warning : colors.accent;
  const compact = size?.isMobile;

  return (
    <div data-print="hide" style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`${alerts.length} avisos del viaje`}
        style={{
          background: `color-mix(in srgb, ${accent} 22%, ${colors.bgDarker})`,
          border: `1px solid ${accent}`,
          borderRadius: radii.lg,
          padding: compact ? "5px 9px" : "7px 11px",
          color: colors.textOnDark,
          cursor: "pointer",
          fontFamily: fonts.sans,
          fontSize: compact ? "12px" : "13px",
          fontWeight: 600,
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          lineHeight: 1,
        }}
        onFocus={(e) => { e.currentTarget.style.boxShadow = shadows.ring; }}
        onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
      >
        <span aria-hidden="true">{warnCount > 0 ? "⚠" : "ℹ"}</span>
        {alerts.length}
        {compact ? "" : ` ${alerts.length === 1 ? "aviso" : "avisos"}`}
        <span aria-hidden="true" style={{ fontSize: "10px", opacity: 0.7 }}>{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <>
          {/* Backdrop closes the popup when tapping outside on mobile. */}
          <div
            onClick={() => setOpen(false)}
            aria-hidden="true"
            style={{ position: "fixed", inset: 0, zIndex: 19, background: "transparent" }}
          />
          <section
            role="dialog"
            aria-label="Avisos del viaje"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              zIndex: 20,
              width: compact ? "min(92vw, 320px)" : "360px",
              maxWidth: "92vw",
              maxHeight: "60vh",
              overflowY: "auto",
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.lg,
              boxShadow: shadows.lg,
              padding: "10px",
              fontFamily: fonts.sans,
            }}
          >
            {alerts.map((a) => (
              <div
                key={a.id}
                style={{
                  padding: "8px 10px",
                  marginBottom: "6px",
                  borderLeft: `3px solid ${a.severity === "warn" ? colors.warning : colors.accent}`,
                  background: colors.bgPanel,
                  borderRadius: radii.md,
                }}
              >
                <div style={{ fontSize: "12.5px", fontWeight: 600, color: colors.text, marginBottom: "3px", lineHeight: 1.3 }}>
                  <span aria-hidden="true" style={{ marginRight: "5px" }}>{a.icon}</span>
                  {a.title}
                </div>
                {a.detail && (
                  <div style={{ fontSize: "11.5px", color: colors.textMuted, lineHeight: 1.4 }}>
                    {a.detail}
                  </div>
                )}
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
};

export default AlertsPill;
