// Candidate accommodations ("bases"). The trip is a single-base stay with day
// trips, so picking the base is THE decision — see components/BaseDecider.jsx.
//
// The Spanish option (Urruti casa, Zilbeti) was discarded by the family
// ("no nos alojaremos en España") and is intentionally absent.
//
// `distances` maps a place id → { km, min, est }. Hard numbers come straight
// from the proposal's distance table; `est: true` flags values we estimated
// for places not in that table (so the UI can show a "~" hint).
//
// `pricePerNight` is a placeholder estimate (the proposal has no prices) and
// is editable in the budget view — treat it as a default, not a fact.

// Where the family starts the trip from (used to draw the inbound route on
// the map, and to warn that Day 0 is mostly a drive).
export const HOME = {
  name: "Ciudad Real",
  lat: 38.9863,
  lng: -3.9272,
};

export const BASES = [
  {
    id: "maison_sare",
    name: "Maison",
    town: "Sare",
    placeId: "sare", // located in Sare itself
    lat: 43.3107,
    lng: -1.5815,
    country: "FR",
    status: "reserved", // ya reservada
    bookingDeadline: "2026-07-17", // cancelación gratuita hasta el 17 julio
    payNow: false,
    pricePerNight: 130, // ESTIMACIÓN editable — la propuesta no trae precio
    capacity: null,
    notes:
      "Reservada. Cancelación gratuita hasta el 17 de julio. En pleno Sare, " +
      "así que el pueblo, su iglesia y el tren de La Rhune quedan a un paseo. " +
      "La más cercana a los pueblos de montaña y a la costa de San Juan de Luz.",
    fromHome: { km: 696, min: 428 }, // 7h 8min desde casa
    distances: {
      // 6 principales: valores de la tabla de la propuesta.
      sare:         { km: 0,  min: 0 },
      ainhoa:       { km: 9,  min: 12 },
      espelette:    { km: 14, min: 17 },
      bayonne:      { km: 34, min: 42 },
      biarritz:     { km: 25, min: 38 },
      sanjuan:      { km: 15, min: 28 },
      // Resto: tiempos reales de conducción (OSRM, 2026).
      zugarramurdi: { km: 9,  min: 19 },
      urdax:        { km: 12, min: 15 },
      sjpp:         { km: 51, min: 56 },
      labastide:    { km: 39, min: 51 },
      ascain:       { km: 8,  min: 12 },
      saintpee:     { km: 10, min: 14 },
      cambo:        { km: 21, min: 25 },
      hendaye:      { km: 29, min: 34 },
      guethary:     { km: 20, min: 26 },
      isturitz:     { km: 42, min: 52 },
      hondarribia:  { km: 31, min: 37 },
      itxassou:     { km: 21, min: 28 },
      donostia:     { km: 46, min: 45 },
      pasaia:       { km: 43, min: 43 },
      baigorry:     { km: 49, min: 55 },
    },
  },
  {
    id: "chez_lucas",
    name: "Chez Lucas",
    town: "Mendiondo",
    placeId: null, // hameau cerca de Mendionde/Hasparren, sin POI propio
    lat: 43.3400,
    lng: -1.2800,
    country: "FR",
    status: "available", // no reservada
    bookingDeadline: "2026-08-04", // se paga ahora y cancelación hasta el 4 agosto
    payNow: true,
    pricePerNight: 110, // ESTIMACIÓN editable
    capacity: null,
    notes:
      "Sin reservar todavía. Se paga ahora y la cancelación es hasta el 4 de " +
      "agosto. Está más al interior (Mendiondo), más cerca de La Bastide-" +
      "Clairence y Saint-Jean-Pied-de-Port, pero más lejos de la costa y de " +
      "Sare. Algo más económica que Maison.",
    fromHome: { km: 730, min: 440 }, // 7h 20min desde casa
    distances: {
      // 6 principales: valores de la tabla de la propuesta.
      sare:         { km: 32, min: 30 },
      ainhoa:       { km: 27, min: 30 },
      espelette:    { km: 18, min: 22 },
      bayonne:      { km: 32, min: 30 },
      biarritz:     { km: 44, min: 39 },
      sanjuan:      { km: 50, min: 44 },
      // Resto: tiempos reales de conducción (OSRM, 2026).
      zugarramurdi: { km: 35, min: 52 },
      urdax:        { km: 31, min: 41 },
      sjpp:         { km: 27, min: 35 },
      labastide:    { km: 16, min: 26 },
      ascain:       { km: 39, min: 46 },
      saintpee:     { km: 30, min: 38 },
      cambo:        { km: 17, min: 25 },
      hendaye:      { km: 65, min: 58 },
      guethary:     { km: 44, min: 45 },
      isturitz:     { km: 15, min: 21 },
      hondarribia:  { km: 67, min: 61 },
      itxassou:     { km: 15, min: 25 },
      donostia:     { km: 82, min: 68 },
      pasaia:       { km: 79, min: 67 },
      baigorry:     { km: 28, min: 38 },
    },
  },
];

export const baseById = (id) => BASES.find((b) => b.id === id) || null;

// Round-trip drive time (minutes) from a base to a place. Returns null when
// the place isn't reachable / not in the table.
export const driveTo = (base, placeId) => {
  const d = base?.distances?.[placeId];
  return d ? d : null;
};
