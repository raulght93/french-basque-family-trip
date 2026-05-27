import { useEffect, useRef, useState } from "react";

// Generic localStorage-backed React state.
// - JSON-serialised; arrays/objects all supported.
// - Quota-exceeded errors are swallowed silently — the value still updates in
//   memory so the UI never breaks, just stops persisting.
// - Safari Private Mode and SSR are handled by feature-detecting localStorage.
//
// Returns [value, setValue, { dirty }] where `dirty` bumps on every write.
const hasStorage = () => {
  try {
    return typeof globalThis.localStorage !== "undefined";
  } catch {
    return false;
  }
};

const read = (key, fallback) => {
  if (!hasStorage()) return fallback;
  try {
    const raw = globalThis.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  if (!hasStorage()) return false;
  try {
    globalThis.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => read(key, defaultValue));
  const dirtyRef = useRef(0);
  const [dirty, setDirty] = useState(0);

  useEffect(() => {
    const ok = write(key, value);
    if (ok) {
      dirtyRef.current += 1;
      setDirty(dirtyRef.current);
    }
  }, [key, value]);

  return [value, setValue, { dirty }];
};

// All persisted keys carry this prefix so "Restablecer todo" can wipe them.
export const STORAGE_PREFIX = "fbt_";

export const clearAllStorage = () => {
  if (!hasStorage()) return;
  try {
    const toRemove = [];
    for (let i = 0; i < globalThis.localStorage.length; i += 1) {
      const k = globalThis.localStorage.key(i);
      if (k?.startsWith(STORAGE_PREFIX)) toRemove.push(k);
    }
    toRemove.forEach((k) => globalThis.localStorage.removeItem(k));
  } catch {
    // ignore
  }
};
