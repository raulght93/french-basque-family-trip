import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { colors, fonts, radii } from "../styles/tokens.js";

// Global lightbox: any descendant can call `useLightbox().open(src, alt, caption)`
// to zoom an image. Esc / backdrop click / × button close. Scroll is locked
// while open. No portal: the overlay is rendered at the provider root with
// position: fixed, which is enough for our single-page app.
const Ctx = createContext({ open: () => {} });

export const useLightbox = () => useContext(Ctx);

// Wikimedia thumbnails can be upgraded to a larger width by editing the URL.
// 1280px is in the whitelisted widths (see CLAUDE.md image rules).
const upscaleWikimedia = (url) => {
  if (typeof url !== "string") return url;
  if (!url.includes("upload.wikimedia.org/wikipedia/commons/thumb")) return url;
  return url.replace(/\/\d+px-/, "/1280px-");
};

export const LightboxProvider = ({ children }) => {
  const [item, setItem] = useState(null);
  const open = useCallback((src, alt, caption) => setItem({ src, alt, caption }), []);
  const close = useCallback(() => setItem(null), []);

  useEffect(() => {
    if (!item) return undefined;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    globalThis.document.addEventListener("keydown", onKey);
    const prev = globalThis.document.body.style.overflow;
    globalThis.document.body.style.overflow = "hidden";
    return () => {
      globalThis.document.removeEventListener("keydown", onKey);
      globalThis.document.body.style.overflow = prev;
    };
  }, [item, close]);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {item && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={item.caption || item.alt || "Imagen ampliada"}
          onClick={close}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.86)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px", cursor: "zoom-out",
          }}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar imagen"
            style={{
              position: "absolute", top: 14, right: 18,
              background: "transparent", color: "#FFF", border: "none",
              fontSize: "30px", cursor: "pointer", lineHeight: 1, padding: "4px 8px",
            }}
          >
            ×
          </button>
          <figure
            onClick={(e) => e.stopPropagation()}
            style={{
              margin: 0, maxWidth: "100%", maxHeight: "100%",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
            }}
          >
            <img
              src={upscaleWikimedia(item.src)}
              alt={item.alt || ""}
              style={{
                maxWidth: "100%", maxHeight: "82vh", objectFit: "contain",
                borderRadius: radii.md, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", background: colors.bgCard,
              }}
            />
            {item.caption && (
              <figcaption style={{ color: "#FFF", fontFamily: fonts.sans, fontSize: "13px", textAlign: "center", maxWidth: 820, lineHeight: 1.5 }}>
                {item.caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </Ctx.Provider>
  );
};

export default LightboxProvider;
