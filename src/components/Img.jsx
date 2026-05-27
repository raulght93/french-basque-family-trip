import { useState } from "react";
import { ZONE_GRADIENT } from "../data/places.js";

// Image with a graceful gradient fallback. If `src` is missing or 404s, we
// render a tinted gradient (by `zone`) instead of a broken-image icon.
export const Img = ({ src, alt, zone = "montana", style, eager = false }) => {
  const [failed, setFailed] = useState(false);
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

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      style={base}
    />
  );
};

export default Img;
