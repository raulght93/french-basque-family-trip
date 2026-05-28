import { lazy, Suspense, useState } from "react";
import { useTripState } from "./hooks/useTripState.js";
import { useResponsive } from "./hooks/useResponsive.js";
import { useGoogleFonts } from "./hooks/useGoogleFonts.js";
import { usePrintMode } from "./hooks/usePrintMode.js";
import { colors, fonts } from "./styles/tokens.js";
import { Header } from "./components/Header.jsx";
import { ActionsBar } from "./components/ActionsBar.jsx";
import { ViewSwitcher } from "./components/ViewSwitcher.jsx";
import { BaseDecider } from "./components/BaseDecider.jsx";
import { ActivitiesPanel } from "./components/ActivitiesPanel.jsx";
import { ItineraryPanel } from "./components/ItineraryPanel.jsx";
import { ChecklistPanel } from "./components/ChecklistPanel.jsx";
import { BudgetPanel } from "./components/BudgetPanel.jsx";
import { PrintView } from "./components/PrintView.jsx";
import { IntroPanel } from "./components/IntroPanel.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { LightboxProvider } from "./components/Lightbox.jsx";

// RegionMap pulls in Leaflet (~150 KB) — keep it off the critical path.
const RegionMap = lazy(() => import("./components/RegionMap.jsx"));

const MapFallback = () => (
  <p style={{ textAlign: "center", padding: "60px 0", color: colors.textSubtle, fontFamily: fonts.sans }}>
    Cargando mapa…
  </p>
);

export default function BasqueGuide() {
  useGoogleFonts();
  const size = useResponsive();
  const state = useTripState();
  const { printMode, triggerPrint } = usePrintMode();
  const [view, setView] = useState("inicio");

  const renderView = () => {
    switch (view) {
      case "inicio":
        return <IntroPanel state={state} size={size} onJump={setView} />;
      case "mapa":
        return (
          <ErrorBoundary label="No se pudo cargar el mapa">
            <Suspense fallback={<MapFallback />}>
              <RegionMap state={state} size={size} />
            </Suspense>
          </ErrorBoundary>
        );
      case "actividades":
        return <ActivitiesPanel state={state} size={size} />;
      case "itinerario":
        return <ItineraryPanel state={state} size={size} />;
      case "checklist":
        return <ChecklistPanel state={state} size={size} />;
      case "presupuesto":
        return <BudgetPanel state={state} size={size} />;
      case "decidir":
        return <BaseDecider state={state} size={size} />;
      default:
        return <IntroPanel state={state} size={size} onJump={setView} />;
    }
  };

  return (
    <LightboxProvider>
    <div style={{ background: colors.bg, minHeight: "100vh", color: colors.text }}>
      <Header state={state} size={size} />
      <ActionsBar state={state} onPrint={triggerPrint} size={size} />
      <ViewSwitcher active={view} onChange={setView} size={size} />

      <main style={{ padding: size.isMobile ? "20px 14px 60px" : "28px 28px 80px" }}>
        {printMode ? <PrintView state={state} /> : renderView()}
      </main>

      <footer
        style={{
          background: colors.bgDarker,
          color: colors.textOnDarkMuted,
          padding: "18px 28px",
          fontSize: "12px",
          fontFamily: fonts.sans,
          textAlign: "center",
        }}
      >
        Guía familiar del País Vasco francés · hecha con cariño · los datos de mapa son © OpenStreetMap y CARTO.
      </footer>
    </div>
    </LightboxProvider>
  );
}
