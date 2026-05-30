import { useEffect } from "react";
import { colors, fonts, radii, shadows } from "../styles/tokens.js";

// Generic confirm/cancel modal. Reused for destructive actions that the
// user should explicitly opt into (e.g. applying a quick-start profile,
// which overwrites the shared itinerary and base).
export const ConfirmDialog = ({
  open,
  title,
  message,
  details,
  extra,
  danger = false,
  confirmLabel = "Continuar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && onCancel) onCancel();
      if (e.key === "Enter" && onConfirm) onConfirm();
    };
    globalThis.document?.addEventListener("keydown", onKey);
    const prev = globalThis.document?.body?.style.overflow;
    if (globalThis.document) globalThis.document.body.style.overflow = "hidden";
    return () => {
      globalThis.document?.removeEventListener("keydown", onKey);
      if (globalThis.document) globalThis.document.body.style.overflow = prev || "";
    };
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  const accentBg = danger ? colors.danger : colors.accent;
  const accentBorder = danger ? colors.danger : colors.accent;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fbt-confirm-title"
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 1100,
        background: "rgba(0,0,0,0.72)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
        fontFamily: fonts.sans,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(520px, 100%)",
          background: colors.bgCard,
          color: colors.text,
          borderRadius: radii.xl,
          padding: "22px 22px 18px",
          border: `1px solid ${colors.border}`,
          boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
        }}
      >
        <h2 id="fbt-confirm-title" style={{ fontFamily: fonts.serif, fontSize: "22px", lineHeight: 1.15, margin: "0 0 8px" }}>
          {title}
        </h2>
        {message && (
          <p style={{ fontSize: "13.5px", color: colors.textBody, lineHeight: 1.55, margin: "0 0 10px" }}>
            {message}
          </p>
        )}
        {details && (
          <ul style={{ margin: "0 0 14px 18px", padding: 0, fontSize: "12.5px", color: colors.textMuted, lineHeight: 1.55 }}>
            {details.map((d, i) => (
              <li key={i} style={{ marginBottom: "3px" }}>{d}</li>
            ))}
          </ul>
        )}
        {extra && (
          <div style={{ margin: "0 0 14px" }}>{extra}</div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", flexWrap: "wrap" }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: "transparent",
                color: colors.textMuted,
                border: `1px solid ${colors.border}`,
                borderRadius: radii.pill,
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: fonts.sans,
              }}
              onFocus={(e) => { e.currentTarget.style.boxShadow = shadows.ring; }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            style={{
              background: accentBg,
              color: colors.onAccent,
              border: `1px solid ${accentBorder}`,
              borderRadius: radii.pill,
              padding: "8px 18px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: fonts.sans,
            }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = shadows.ring; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
