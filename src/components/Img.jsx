import { useState } from "react";
import { ZONE_GRADIENT } from "../data/places.js";
import { useLightbox } from "./Lightbox.jsx";

// Image with a graceful gradient fallback and optional click-to-zoom.
// - `src` missing or 404 → render a tinted gradient by `zone`.
// - `zoomable` (default true when there's a src) wraps the image in a button
//   that opens the global lightbox with an upscaled version + caption.
export const Img = ({ src, alt, zone = "montana", style, eager = false, zoomable = true, caption }) => {
  const [failed, setFailed] = useState(false);
  const { open } = useLightbox();
  const base = {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    ...style,
  };

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        style={{ ...base, background: ZONE_GRADIENT[zone] || ZONE_GRADIENT.montana }}
      />
    );
  }

  const img = (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      style={base}
    />
  );

  if (!zoomable) return img;

  return (
    <button
      type="button"
      data-print="hide"
      onClick={() => open(src, alt, caption || alt)}
      aria-label={`Ampliar imagen: ${alt}`}
      style={{
        display: "block", width: "100%", height: "100%", padding: 0, margin: 0,
        background: "none", border: "none", cursor: "zoom-in",
      }}
    >
      {img}
    </button>
  );
};

export default Img;
