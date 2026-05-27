import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "../hooks/useTheme.js";
import { PLACES, placeById, ZONE_LABEL } from "../data/places.js";
import { BASES, baseById } from "../data/bases.js";
import { ACTIVITIES, activityById, activitiesForPlace } from "../data/activities.js";
import { colors, fonts, radii } from "../styles/tokens.js";
import { formatDow } from "../utils/dates.js";

// Real interactive map (Leaflet + CARTO raster tiles). It shows the two
// candidate bases and every town, and — once a base is chosen — draws the
// day-by-day itinerary as routes that follow real roads.
//
// Road geometry comes from the public OSRM router at runtime
// (router.project-osrm.org). It's fetched lazily and cached; if a request
// fails we fall back to a straight dashed line, so the map always renders.
// Lazy-loaded so Leaflet (~150 KB) stays off the critical path.

const TILES = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png",
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
};

const ZONE_GLYPH = { montana: "⛰️", costa: "🏖️", navarra: "🪄" };

// Distinct, legible colours for up to 8 days (cycles after that).
const DAY_COLORS = ["#2C6E8F", "#B0292F", "#2E6B4F", "#9A6014", "#7A5BA0", "#0E7C7B", "#C2185B", "#4E5D2A"];
const dayColor = (i) => DAY_COLORS[i % DAY_COLORS.length];

const resolveColor = (varStr) => {
  if (typeof varStr !== "string" || !varStr.startsWith("var(")) return varStr;
  if (typeof globalThis.document === "undefined") return varStr;
  const name = varStr.slice(4, -1).trim();
  const val = globalThis.getComputedStyle(globalThis.document.documentElement).getPropertyValue(name);
  return val.trim() || varStr;
};

const baseIconHtml = (accent, bg, chosen) => `
<div style="position:relative;width:42px;height:42px;border-radius:50% 50% 50% 0;
  transform:rotate(-45deg);background:${chosen ? accent : bg};
  border:3px solid ${accent};box-shadow:0 2px 6px rgba(0,0,0,0.4);
  display:flex;align-items:center;justify-content:center;">
  <span style="transform:rotate(45deg);font-size:20px;">🏠</span>
</div>`;

const placeIconHtml = (glyph, ring, bg, badge) => `
<div style="position:relative;width:34px;height:34px;border-radius:50%;background:${bg};
  border:2px solid ${ring};display:flex;align-items:center;justify-content:center;
  font-size:17px;box-shadow:0 1px 4px rgba(0,0,0,0.35);">
  <span>${glyph}</span>
  ${badge != null ? `<span style="position:absolute;right:-6px;top:-6px;min-width:18px;height:18px;
    border-radius:9px;background:${badge.color};color:#fff;border:1.5px solid ${bg};
    font:700 10px/18px 'DM Sans',sans-serif;text-align:center;padding:0 3px;">${badge.text}</span>` : ""}
</div>`;

// Fetch a driving route through waypoints [[lat,lng],...]; returns Leaflet
// latlngs ([[lat,lng],...]) following roads, or null on failure.
const fetchRoute = async (pts) => {
  const coords = pts.map(([lat, lng]) => `${lng},${lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM ${res.status}`);
  const data = await res.json();
  const line = data?.routes?.[0]?.geometry?.coordinates;
  if (!line) throw new Error("no geometry");
  return line.map(([lng, lat]) => [lat, lng]);
};

export const RegionMap = ({ state, size }) => {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const routeCache = useRef(new Map()); // signature → latlngs

  const base = baseById(state.baseId);

  // Per-day route plan: ordered unique places (by id) the day visits, each with
  // a point, plus the base at both ends. Only days that visit somewhere.
  const dayPlans = useMemo(() => {
    if (!base) return [];
    const plans = [];
    state.days.forEach((d, i) => {
      const actIds = state.activitiesOnDay(i);
      const seen = new Set();
      const stops = [];
      actIds.forEach((id) => {
        const a = activityById(id);
        if (!a) return;
        const p = placeById(a.placeId);
        const lat = a.lat ?? p?.lat;
        const lng = a.lng ?? p?.lng;
        if (lat == null || lng == null) return;
        if (seen.has(a.placeId)) return;
        seen.add(a.placeId);
        stops.push({ placeId: a.placeId, name: p?.name ?? a.name, pt: [lat, lng] });
      });
      if (stops.length === 0) return;
      const pts = [[base.lat, base.lng], ...stops.map((s) => s.pt), [base.lat, base.lng]];
      plans.push({ dayIdx: i, date: d, stops, pts });
    });
    return plans;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base?.id, state.itinerary, state.days]);

  // Which place ids appear in the itinerary (for marker day badges).
  const placeDayBadge = useMemo(() => {
    const map = {};
    dayPlans.forEach((plan) => {
      plan.stops.forEach((s) => {
        if (map[s.placeId] == null) map[s.placeId] = plan.dayIdx;
      });
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayPlans]);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    let cancelled = false;

    const accent = resolveColor(colors.accent);
    const green = resolveColor(colors.green);
    const ocean = resolveColor(colors.ocean);
    const bg = resolveColor(colors.bgCard);

    const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false, dragging: true, tap: true });
    mapRef.current = map;

    const tile = TILES[resolvedTheme] || TILES.light;
    L.tileLayer(tile.url, { attribution: tile.attr, maxZoom: 18, subdomains: "abcd" }).addTo(map);

    const allPts = [];

    // Place markers (with a day badge if the place is in the itinerary).
    PLACES.forEach((p) => {
      const glyph = ZONE_GLYPH[p.zone] || "📍";
      const ring = p.zone === "costa" ? ocean : p.zone === "navarra" ? "#8A6D2F" : green;
      const dayIdx = placeDayBadge[p.id];
      const badge = dayIdx != null ? { text: `D${dayIdx + 1}`, color: dayColor(dayIdx) } : null;
      const icon = L.divIcon({
        className: "fbt-place",
        html: placeIconHtml(glyph, ring, bg, badge),
        iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -14],
      });
      const m = L.marker([p.lat, p.lng], { icon, title: p.name }).addTo(map);
      const acts = activitiesForPlace(p.id).map((a) => a.name).slice(0, 4);
      m.bindPopup(
        `<div style="font-family:'DM Sans',sans-serif;min-width:170px;">
          <div style="font-weight:600;font-size:13px;">${p.name}</div>
          <div style="font-size:11px;color:#888;margin-bottom:3px;">${ZONE_LABEL[p.zone]}</div>
          ${acts.length ? `<div style="font-size:11.5px;color:#555;">${acts.join(" · ")}</div>` : ""}
        </div>`,
      );
      allPts.push([p.lat, p.lng]);
    });

    // Base markers.
    BASES.forEach((b) => {
      const chosen = state.baseId === b.id;
      const icon = L.divIcon({
        className: "fbt-base",
        html: baseIconHtml(accent, bg, chosen),
        iconSize: [42, 42], iconAnchor: [21, 40], popupAnchor: [0, -38],
      });
      const m = L.marker([b.lat, b.lng], { icon, title: `${b.name} (${b.town})`, zIndexOffset: 1000 }).addTo(map);
      m.bindPopup(
        `<div style="font-family:'DM Sans',sans-serif;min-width:150px;">
          <div style="font-weight:700;font-size:13px;">🏠 ${b.name}</div>
          <div style="font-size:11px;color:#888;">${b.town} · ${chosen ? "elegida" : "candidata"}</div>
        </div>`,
      );
      allPts.push([b.lat, b.lng]);
    });

    // Itinerary routes (one per day). Draw a straight fallback immediately,
    // then upgrade to a real road route from OSRM (cached).
    const drawRoute = async (plan) => {
      const color = dayColor(plan.dayIdx);
      const sig = plan.pts.map((p) => p.join(",")).join("|");

      const fallback = L.polyline(plan.pts, { color, weight: 3, opacity: 0.5, dashArray: "4,7" }).addTo(map);
      plan.pts.forEach((pt) => allPts.push(pt));

      let latlngs = routeCache.current.get(sig);
      if (!latlngs) {
        try {
          latlngs = await fetchRoute(plan.pts);
          routeCache.current.set(sig, latlngs);
        } catch {
          return; // keep the dashed fallback
        }
      }
      if (cancelled || !mapRef.current) return;
      map.removeLayer(fallback);
      L.polyline(latlngs, { color, weight: 4, opacity: 0.85 }).addTo(map);
    };

    dayPlans.forEach((plan) => { drawRoute(plan); });

    if (allPts.length) map.fitBounds(L.latLngBounds(allPts), { padding: [45, 45], maxZoom: 12 });

    return () => {
      cancelled = true;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme, state.baseId, dayPlans, placeDayBadge]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ fontFamily: fonts.serif, fontSize: size.isMobile ? "26px" : "32px", color: colors.text, marginBottom: "6px" }}>
        El mapa
      </h2>
      <p style={{ fontFamily: fonts.sans, fontSize: "14px", color: colors.textMuted, marginBottom: "16px", lineHeight: 1.5 }}>
        🏠 bases candidatas · ⛰️ montaña · 🏖️ costa · 🪄 Valle de Xareta.{" "}
        {base
          ? "Cada color es un día del itinerario; las rutas siguen las carreteras reales (ida y vuelta a la base)."
          : "Elige base y monta el itinerario para ver las rutas de cada día."}
      </p>

      <div
        ref={containerRef}
        role="application"
        aria-label="Mapa interactivo del País Vasco francés con el itinerario"
        style={{
          width: "100%",
          height: size.isMobile ? "380px" : size.isDesktop ? "560px" : "460px",
          borderRadius: radii.lg,
          border: `1px solid ${colors.border}`,
          overflow: "hidden",
          fontFamily: fonts.sans,
        }}
      />

      {/* Day legend */}
      {dayPlans.length > 0 && (
        <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "grid", gridTemplateColumns: size.isDesktop ? "repeat(2,1fr)" : "1fr", gap: "6px 16px" }}>
          {dayPlans.map((plan) => (
            <li key={plan.dayIdx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", fontFamily: fonts.sans, color: colors.textBody }}>
              <span style={{ flex: "0 0 22px", height: "4px", borderRadius: "2px", background: dayColor(plan.dayIdx) }} />
              <strong style={{ whiteSpace: "nowrap" }}>Día {plan.dayIdx + 1}</strong>
              <span style={{ color: colors.textMuted }}>· {formatDow(plan.date)} · {plan.stops.map((s) => s.name).join(" → ")}</span>
            </li>
          ))}
        </ul>
      )}

      <p style={{ fontSize: "11px", color: colors.textSubtle, margin: "8px 0 0", fontStyle: "italic" }}>
        Rutas aproximadas por carretera (OSRM); si un tramo no carga, se muestra una línea recta discontinua.
        Arrastra para desplazar · zoom con los botones (scroll desactivado).
      </p>
    </div>
  );
};

export default RegionMap;
