import { useCallback, useEffect, useState } from "react";
import { STORAGE_PREFIX } from "./useLocalStorage.js";

// Three states: "light", "dark", or "auto" (follow OS preference).
// Persisted under `fbt_theme`; applied via documentElement.dataset.theme.
// `resolvedTheme` is always "light" or "dark" — useful for the toggle UI.

const KEY = `${STORAGE_PREFIX}theme`;
const VALID = new Set(["light", "dark", "auto"]);

const safeRead = () => {
  if (!globalThis.localStorage) return "auto";
  try {
    const raw = globalThis.localStorage.getItem(KEY);
    return VALID.has(raw) ? raw : "auto";
  } catch {
    return "auto";
  }
};

const safeWrite = (value) => {
  if (!globalThis.localStorage) return;
  try {
    globalThis.localStorage.setItem(KEY, value);
  } catch {
    // ignore quota / private mode errors
  }
};

const detectSystem = () => {
  if (!globalThis.matchMedia) return "light";
  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyToRoot = (theme) => {
  if (!globalThis.document) return;
  const root = globalThis.document.documentElement;
  if (theme === "auto") {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = theme;
  }
};

applyToRoot(safeRead());

const NEXT_THEME = { auto: "light", light: "dark", dark: "auto" };

const resolveTheme = (theme, systemDark) => {
  if (theme === "light" || theme === "dark") return theme;
  return systemDark ? "dark" : "light";
};

export const useTheme = () => {
  const [theme, setTheme] = useState(safeRead);
  const [systemDark, setSystemDark] = useState(() => detectSystem() === "dark");

  useEffect(() => {
    safeWrite(theme);
    applyToRoot(theme);
  }, [theme]);

  useEffect(() => {
    if (!globalThis.matchMedia) return undefined;
    const mq = globalThis.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const cycleTheme = useCallback(() => {
    setTheme((prev) => NEXT_THEME[prev] || "auto");
  }, []);

  const resolvedTheme = resolveTheme(theme, systemDark);

  return { theme, resolvedTheme, setTheme, cycleTheme };
};
