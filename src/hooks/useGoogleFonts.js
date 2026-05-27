import { useEffect } from "react";
import { fontUrl } from "../styles/tokens.js";

// Injects the Google Fonts stylesheet once. Cleans up on unmount so HMR doesn't
// stack duplicate <link> tags.
export const useGoogleFonts = () => {
  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = fontUrl;
    document.head.appendChild(l);
    return () => {
      if (document.head.contains(l)) l.remove();
    };
  }, []);
};
