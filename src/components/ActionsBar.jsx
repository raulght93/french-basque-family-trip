import { useEffect, useRef, useState } from "react";
import { colors, fonts, radii, shadows } from "../styles/tokens.js";
import { useTheme } from "../hooks/useTheme.js";

const THEME_GLYPH = { auto: "🌗", light: "☀️", dark: "🌙" };

const btnStyle = {
  background: colors.overlayOnDarkMed,
  color: colors.textOnDark,
  border: `1px solid ${colors.overlayOnDarkMed}`,
  borderRadius: radii.pill,
  padding: "6px 12px",
  fontSize: "12.5px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: fonts.sans,
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
};

// Compartir (copia URL) · Imprimir · Restablecer (dos pasos) · tema · 💾 guardado.
export const ActionsBar = ({ state, onPrint, size }) => {
  const { theme, cycleTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [flashSaved, setFlashSaved] = useState(false);
  const resetTimer = useRef(null);

  // Blink the "Guardado" badge whenever something persists.
  useEffect(() => {
    if (state.savedTick === 0) return;
    setFlashSaved(true);
    const t = setTimeout(() => setFlashSaved(false), 1600);
    return () => clearTimeout(t);
  }, [state.savedTick]);

  const handleShare = async () => {
    const url = state.buildShareUrl();
    try {
      await globalThis.navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      globalThis.prompt?.("Copia este enlace para compartir:", url);
    }
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      resetTimer.current = setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    clearTimeout(resetTimer.current);
    state.resetAll();
  };

  return (
    <div
      data-print="hide"
      style={{
        background: colors.bgDarker,
        padding: size.isMobile ? "8px 12px" : "10px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "8px",
        flexWrap: "wrap",
      }}
    >
      {flashSaved && (
        <span style={{ color: colors.successOnDark, fontSize: "12px", fontFamily: fonts.sans, marginRight: "auto" }}>
          💾 Guardado
        </span>
      )}

      <button type="button" style={btnStyle} onClick={handleShare} aria-label="Compartir enlace del viaje">
        {copied ? "✓ Copiado" : "🔗 Compartir"}
      </button>

      <button type="button" style={btnStyle} onClick={onPrint} aria-label="Imprimir o guardar como PDF">
        🖨️ Imprimir
      </button>

      <button
        type="button"
        onClick={handleReset}
        aria-label="Restablecer todo"
        style={{
          ...btnStyle,
          background: confirmReset ? colors.danger : btnStyle.background,
          borderColor: confirmReset ? colors.danger : btnStyle.border,
        }}
      >
        {confirmReset ? "⚠️ ¿Seguro?" : "↺ Reset"}
      </button>

      <button
        type="button"
        style={btnStyle}
        onClick={cycleTheme}
        aria-label={`Tema: ${theme}. Cambiar.`}
        title={`Tema: ${theme}`}
      >
        {THEME_GLYPH[theme] || "🌗"}
      </button>
    </div>
  );
};

export default ActionsBar;
