import { useCallback, useEffect, useState } from "react";

// Inject a one-time print stylesheet. Elements with data-print="hide" are
// hidden; data-print="expand" forces sections open during printing.
const PRINT_STYLE = `
@media print {
  *[data-print="hide"],
  nav, button, input[type="range"], [role="tablist"] {
    display: none !important;
  }
  *[data-print="expand"] { display: block !important; }
  body {
    background: #fff !important;
    color: #1A1A1A !important;
    font-size: 11.5px !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  main { max-width: none !important; padding: 0 !important; margin: 0 !important; }
  h1, h2, h3, h4 { page-break-after: avoid; break-after: avoid; }
  article, fieldset, section { page-break-inside: avoid; break-inside: avoid; }
  [style*="background"] { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  a { color: #1A1A1A !important; text-decoration: none !important; }
  img { max-height: 180px !important; object-fit: cover !important; border-radius: 6px !important; display: block !important; }
  table { border-collapse: collapse !important; width: 100% !important; }
  th, td { border-bottom: 1px solid #DDD !important; }
}
@page { margin: 14mm 16mm; size: A4 portrait; }
`;

let injected = false;
const ensureStyle = () => {
  if (injected || typeof globalThis.document === "undefined") return;
  const tag = globalThis.document.createElement("style");
  tag.id = "fbt-print-style";
  tag.textContent = PRINT_STYLE;
  globalThis.document.head.appendChild(tag);
  injected = true;
};

export const usePrintMode = () => {
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => { ensureStyle(); }, []);

  const triggerPrint = useCallback(() => {
    setPrintMode(true);
    setTimeout(() => {
      if (typeof globalThis.window === "undefined") return;
      globalThis.window.print();
      setPrintMode(false);
    }, 600);
  }, []);

  return { printMode, triggerPrint };
};
