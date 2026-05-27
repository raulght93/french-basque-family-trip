import { Component } from "react";
import { colors, fonts, radii } from "../styles/tokens.js";

// Wraps lazy-loaded chunks (RegionMap). If a chunk fails to load we render a
// compact, dismissible notice instead of an indefinite "Cargando…".
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (typeof globalThis.console !== "undefined") {
      globalThis.console.warn("ErrorBoundary caught:", error);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        role="alert"
        style={{
          background: colors.warningSoft,
          border: `1px solid ${colors.warning}`,
          borderRadius: radii.md,
          padding: "12px 16px",
          margin: "12px 0",
          color: colors.text,
          fontFamily: fonts.sans,
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <span>⚠️ {this.props.label || "No se pudo cargar este componente"}.</span>
        <button
          type="button"
          onClick={this.handleRetry}
          style={{
            background: colors.accent,
            color: colors.onAccent,
            border: "none",
            borderRadius: radii.pill,
            padding: "4px 12px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: fonts.sans,
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }
}
