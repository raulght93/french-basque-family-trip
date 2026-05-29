import { useEffect } from "react";
import { useResponsive } from "../hooks/useResponsive.js";
import { colors, fonts, radii, shadows } from "../styles/tokens.js";
import { TEAM } from "../data/team.js";

// First-visit (and "change identity") picker. The chosen identity is locked
// per browser and used to attribute votes to the right family member.
export const IdentityModal = ({ open, currentId, onPick, onCancel }) => {
  const size = useResponsive();
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape" && onCancel) onCancel(); };
    globalThis.document?.addEventListener("keydown", onKey);
    const prev = globalThis.document?.body?.style.overflow;
    if (globalThis.document) globalThis.document.body.style.overflow = "hidden";
    return () => {
      globalThis.document?.removeEventListener("keydown", onKey);
      if (globalThis.document) globalThis.document.body.style.overflow = prev || "";
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fbt-identity-title"
      onClick={onCancel || (() => {})}
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
          width: "min(640px, 100%)",
          background: colors.bgCard,
          color: colors.text,
          borderRadius: radii.xl,
          padding: "22px 22px 20px",
          boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
          border: `1px solid ${colors.border}`,
        }}
      >
        <h2 id="fbt-identity-title" style={{ fontFamily: fonts.serif, fontSize: "26px", lineHeight: 1.1, marginBottom: "4px" }}>
          {currentId ? "Cambiar de participante" : "¿Quién eres?"}
        </h2>
        <p style={{ fontSize: "13.5px", color: colors.textMuted, lineHeight: 1.5, marginBottom: "16px" }}>
          {currentId
            ? "Elige otra persona si te equivocaste. Tus votos volverán a atribuirse a quien selecciones aquí."
            : "Elígete de la lista. A partir de aquí cualquier voto se atribuirá a tu nombre y se compartirá con el resto de la familia."}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: size.isMobile ? "1fr" : "repeat(2, 1fr)", gap: "8px" }}>
          {TEAM.map((m) => {
            const active = m.id === currentId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onPick(m.id)}
                aria-pressed={active}
                style={{
                  textAlign: "left",
                  background: active ? colors.accent : colors.bgPanel,
                  color: active ? colors.onAccent : colors.text,
                  border: `1px solid ${active ? colors.accent : colors.border}`,
                  borderRadius: radii.lg,
                  padding: "12px 14px",
                  fontSize: "15px",
                  fontWeight: active ? 700 : 600,
                  fontFamily: fonts.sans,
                  cursor: "pointer",
                  transition: "background 0.12s",
                }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = shadows.ring; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
              >
                <span aria-hidden="true" style={{ marginRight: "8px" }}>👤</span>
                {m.name}
                {active && <span style={{ float: "right" }}>✓</span>}
              </button>
            );
          })}
        </div>

        {onCancel && (
          <div style={{ marginTop: "16px", textAlign: "right" }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: "transparent",
                color: colors.textMuted,
                border: "none",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: fonts.sans,
              }}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdentityModal;
