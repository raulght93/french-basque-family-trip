import { useEffect, useState } from "react";
import { breakpoints } from "../styles/tokens.js";

// Current breakpoint as { isMobile, isTablet, isDesktop, width }.
// mobile < 768 · tablet 768-1023 · desktop >= 1024.
const compute = () => {
  const w = globalThis.window?.innerWidth ?? 1024;
  return {
    width: w,
    isMobile:  w < breakpoints.mobile,
    isTablet:  w >= breakpoints.mobile && w < breakpoints.desktop,
    isDesktop: w >= breakpoints.desktop,
  };
};

export const useResponsive = () => {
  const [state, setState] = useState(compute);
  useEffect(() => {
    const onResize = () => setState(compute());
    globalThis.window.addEventListener("resize", onResize);
    return () => globalThis.window.removeEventListener("resize", onResize);
  }, []);
  return state;
};
