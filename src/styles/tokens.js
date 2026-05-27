// Design tokens — dual palette (light + dark) via CSS custom properties so
// components don't re-render when the theme switches. Components import
// `colors`, `shadows`, etc. and receive strings like "var(--c-bg)"; the hex
// values live in the palettes below and are injected as a <style> at module
// load, before the first React paint.
//
// Palette intent: French Basque country. Light mode = limestone cream + pine
// green + Basque red (the txapela / Espelette pepper) with an Atlantic ocean
// blue for the coast. Dark mode = deep forest night with warm coral-red
// accents. Both keep the same keys so the theme switch is a pure var swap.

// ─── Raw palettes ───────────────────────────────────────────────────────────

const LIGHT_PALETTE = {
  // Surfaces
  bg:              "#F4F1E8", // limestone cream
  bgPanel:         "#E9E4D5", // dusty stone
  bgCard:          "#FFFFFF",
  bgRaised:        "#FAF8F0",
  bgDark:          "#1E3A2E", // deep pine (header/toolbar)
  bgDarker:        "#15291F", // deeper pine (footer)
  bgSoft:          "#EEF2E6", // pale green wash

  // Text — tuned for WCAG AA against `bg`.
  text:            "#1A2620",
  textBody:        "#26352D",
  textMuted:       "#4C5A52", // ≈7:1 on bg
  textSubtle:      "#6E796F", // ≈4.6:1 on bg (AA)
  textOnDark:      "#F0EDE2",
  textOnDarkMuted: "#BDC7BB",

  // Borders
  border:          "#D7D1BF",
  borderStrong:    "#BAB29A",
  borderDark:      "#2C4A3B",

  // Accent — deep Basque red. ≈5.6:1 on white (AA pass).
  accent:          "#A82C2C",
  accentHover:     "#852020",
  accentSoft:      "#F7E4E1",
  accentMuted:     "#E89E9B",
  accentBorder:    "#C4564F",

  // Secondary accent — pine green (used for nature/montaña cues).
  green:           "#2E6B4F",
  greenSoft:       "#E2EFE6",
  ocean:           "#2C6E8F", // Atlantic blue (costa cues)
  oceanSoft:       "#DCEAF1",

  // Semantic
  success:         "#3D6B28",
  successSoft:     "#E9F0DA",
  successText:     "#2D4720",
  warning:         "#9A6014",
  warningSoft:     "#F7E9CF",
  warningText:     "#7A4E10",
  danger:          "#A82C2C",
  dangerSoft:      "#F6DDD7",
  dangerText:      "#7A211C",

  // Chips painted on a dark surface (header/toolbar).
  successOnDark:   "#86EFAC",
  warningOnDark:   "#FCD34D",
  dangerOnDark:    "#FCA5A5",

  // Foreground for text/icons on the accent / saturated backgrounds.
  onAccent:        "#FFFFFF",

  // Map surfaces (RegionMap legend / fallbacks).
  mapOcean:        "#CFE2EC",
  mapLand:         "#EDEAD8",
  mapLandMuted:    "#E2DECB",
  mapBorder:       "#A39B82",
  mapLabel:        "#4C5A52",

  // Focus rings
  focusRing:       "#A82C2C",
  ringAlpha:       "rgba(168, 44, 44, 0.40)",
  ringInverseAlpha:"rgba(232, 158, 155, 0.55)",

  // Overlays
  overlayLow:      "rgba(26, 38, 32, 0.04)",
  overlayMed:      "rgba(26, 38, 32, 0.08)",
  overlayOnDarkLow:"rgba(240, 237, 226, 0.05)",
  overlayOnDarkMed:"rgba(240, 237, 226, 0.10)",

  // Shadow colors (the strings live in `shadows` below).
  shadowSm:        "rgba(26, 38, 32, 0.06)",
  shadowMd:        "rgba(26, 38, 32, 0.09)",
  shadowLg:        "rgba(26, 38, 32, 0.13)",
};

const DARK_PALETTE = {
  // Surfaces
  bg:              "#121A15", // deep forest night
  bgPanel:         "#19241D",
  bgCard:          "#1F2D24",
  bgRaised:        "#283A2E",
  bgDark:          "#0C140F",
  bgDarker:        "#060B08",
  bgSoft:          "#22311F",

  // Text
  text:            "#EDF0E8",
  textBody:        "#DCE3D6",
  textMuted:       "#A9B5A4",
  textSubtle:      "#93A08D",
  textOnDark:      "#EDF0E8",
  textOnDarkMuted: "#A9B5A4",

  // Borders
  border:          "#2C3A2F",
  borderStrong:    "#43564A",
  borderDark:      "#0F1812",

  // Accent — warm coral-red, brighter for dark surfaces.
  accent:          "#E8736B",
  accentHover:     "#F08C84",
  accentSoft:      "#3A201E",
  accentMuted:     "#E89E9B",
  accentBorder:    "#C4564F",

  // Secondary
  green:           "#7FC79B",
  greenSoft:       "#1E3023",
  ocean:           "#7BB6D2",
  oceanSoft:       "#162A33",

  // Semantic
  success:         "#8DBB6B",
  successSoft:     "#22311C",
  successText:     "#B5D592",
  warning:         "#E0B25A",
  warningSoft:     "#33260F",
  warningText:     "#F0C572",
  danger:          "#E8736B",
  dangerSoft:      "#3A201E",
  dangerText:      "#F0A39C",

  successOnDark:   "#86EFAC",
  warningOnDark:   "#FCD34D",
  dangerOnDark:    "#FCA5A5",

  onAccent:        "#1A0E0D",

  mapOcean:        "#16252E",
  mapLand:         "#283A2E",
  mapLandMuted:    "#1E2D24",
  mapBorder:       "#4E6354",
  mapLabel:        "#A9B5A4",

  focusRing:       "#E8736B",
  ringAlpha:       "rgba(232, 115, 107, 0.45)",
  ringInverseAlpha:"rgba(232, 158, 155, 0.55)",

  overlayLow:      "rgba(237, 240, 232, 0.04)",
  overlayMed:      "rgba(237, 240, 232, 0.08)",
  overlayOnDarkLow:"rgba(237, 240, 232, 0.05)",
  overlayOnDarkMed:"rgba(237, 240, 232, 0.10)",

  shadowSm:        "rgba(0, 0, 0, 0.30)",
  shadowMd:        "rgba(0, 0, 0, 0.40)",
  shadowLg:        "rgba(0, 0, 0, 0.50)",
};

// ─── CSS variable references ───────────────────────────────────────────────

const COLOR_KEYS = Object.keys(LIGHT_PALETTE);

export const colors = Object.fromEntries(
  COLOR_KEYS.map((k) => [k, `var(--c-${k})`]),
);

export const fonts = {
  serif: "'Cormorant Garamond', Georgia, serif",
  sans:  "'DM Sans', system-ui, sans-serif",
};

export const fontUrl =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap";

export const breakpoints = { mobile: 768, desktop: 1024 };

export const shadows = {
  sm: "0 1px 2px var(--c-shadowSm)",
  md: "0 2px 8px var(--c-shadowMd)",
  lg: "0 8px 24px var(--c-shadowLg)",
  ring: "0 0 0 3px var(--c-ringAlpha)",
  ringInverse: "0 0 0 3px var(--c-ringInverseAlpha)",
};

export const radii = { sm: 6, md: 8, lg: 12, xl: 16, pill: 999 };

export const spacing = (n) => `${n * 4}px`;

export const focusable = { outline: "none" };
export const focusRing = (onDark = false) => (onDark ? shadows.ringInverse : shadows.ring);

export const surfaces = {
  card: {
    background: colors.bgCard,
    borderRadius: radii.lg,
    boxShadow: shadows.sm,
    border: `1px solid ${colors.border}`,
  },
  cardHover: { boxShadow: shadows.md, transform: "translateY(-1px)" },
  darkCard: {
    background: colors.bgDark,
    borderRadius: radii.lg,
    border: `1px solid ${colors.borderDark}`,
  },
  softPanel: {
    background: colors.bgPanel,
    borderRadius: radii.lg,
    border: `1px solid ${colors.border}`,
  },
};

// ─── Theme CSS injection ────────────────────────────────────────────────────

const declsFor = (palette) =>
  Object.entries(palette).map(([k, v]) => `  --c-${k}: ${v};`).join("\n");

export const THEMES_CSS = `
:root {
${declsFor(LIGHT_PALETTE)}
}
@media (prefers-color-scheme: dark) {
  :root {
${declsFor(DARK_PALETTE).replace(/^/gm, "  ")}
  }
}
[data-theme="light"] {
${declsFor(LIGHT_PALETTE)}
}
[data-theme="dark"] {
${declsFor(DARK_PALETTE)}
}
summary::-webkit-details-marker { display: none; }
details[open] > summary span[aria-hidden="true"].chevron { transform: rotate(180deg); }
`;

const STYLE_TAG_ID = "fbt-theme-vars";
const injectThemeStyles = () => {
  if (!globalThis.document) return;
  if (globalThis.document.getElementById(STYLE_TAG_ID)) return;
  const tag = globalThis.document.createElement("style");
  tag.id = STYLE_TAG_ID;
  tag.textContent = THEMES_CSS;
  globalThis.document.head.appendChild(tag);
};
injectThemeStyles();

export const LIGHT = LIGHT_PALETTE;
export const DARK = DARK_PALETTE;
