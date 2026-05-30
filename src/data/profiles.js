// Quick-start profiles: ready-made trial plans for a 7-day (6-night) stay.
// Applying one sets the suggested base, votes every activity in the plan for
// all current participants, and lays them out day by day. Then you tweak by
// hand. `days` is keyed by day index (0 = arrival day).
//
// Plans are hand-built from how people actually visit the area (top sights
// first, coast and interior balanced, drive times kept sensible from the base).

export const PROFILES = [
  {
    id: "clasico",
    name: "Clásico equilibrado",
    glyph: "🧭",
    base: "maison_sare",
    desc: "Lo imprescindible: La Rhune, pueblos de montaña, costa y cuevas, sin agobios.",
    days: {
      0: ["casco_sare", "iglesia_sare"],
      1: ["tren_larrun"],
      2: ["sanjuan_costa", "guethary_pueblo"],
      3: ["espelette_pueblo", "ainhoa_pueblo"],
      4: ["biarritz_costa", "bayonne_ciudad"],
      5: ["cuevas_sare", "ortillopitz"],
      6: ["saintpee_lago"],
    },
  },
  {
    id: "playas",
    name: "Playas y costa",
    glyph: "🏖️",
    base: "maison_sare",
    desc: "Foco en el mar: San Juan de Luz, Hendaya, Biarritz y Hondarribia.",
    days: {
      0: ["casco_sare"],
      1: ["sanjuan_costa"],
      2: ["hendaye_playa", "hondarribia_casco"],
      3: ["biarritz_costa"],
      4: ["guethary_pueblo", "bayonne_ciudad"],
      5: ["saintpee_lago"],
      6: ["tren_larrun"],
    },
  },
  {
    id: "naturaleza",
    name: "Naturaleza y montaña",
    glyph: "🥾",
    base: "maison_sare",
    desc: "Tren de La Rhune, Valle de Xareta, Pas de Roland, cuevas y senderos.",
    days: {
      // Llegada suave + Ascain (al pie de La Rhune).
      0: ["casco_sare", "ascain_pueblo"],
      // Día estrella en la montaña.
      1: ["tren_larrun"],
      // Valle de Xareta del tirón: caminata por los Pottoks + cueva de las
      // brujas en Zugarramurdi (en vez de partirlo en dos días).
      2: ["pottoks_bleus", "cuevas_zugarramurdi"],
      // Cuevas en la propia Sare.
      3: ["cuevas_sare"],
      // Cambo (Villa Arnaga) + Itxassou (Pas de Roland) en el mismo eje.
      4: ["villa_arnaga", "itxassou_pasroland"],
      // Ciudadela en el camino jacobeo.
      5: ["sjpp_pueblo"],
      // Cierre tranquilo en el lago.
      6: ["saintpee_lago"],
    },
  },
  {
    id: "tranquilo",
    name: "Sin prisa · accesible",
    glyph: "♿",
    base: "maison_sare",
    desc: "Días suaves y sitios accesibles, evitando senderos y escaleras difíciles.",
    days: {
      0: ["casco_sare", "iglesia_sare"],
      1: ["sanjuan_costa"],
      2: ["espelette_pueblo", "ainhoa_pueblo"],
      3: ["villa_arnaga"],
      4: ["hendaye_playa"],
      5: ["bayonne_ciudad"],
      6: ["saintpee_lago"],
    },
  },
  {
    id: "interior",
    name: "Interior · prueba Chez Lucas",
    glyph: "🏡",
    base: "chez_lucas",
    desc: "Plan pensado para la base de Mendiondo: Isturitz, Cambo, La Bastide e interior.",
    days: {
      0: ["labastide_pueblo"],
      1: ["isturitz_cuevas"],
      2: ["villa_arnaga", "itxassou_pasroland"],
      3: ["espelette_pueblo", "ainhoa_pueblo"],
      4: ["bayonne_ciudad"],
      5: ["sjpp_pueblo"],
      6: ["casco_sare", "iglesia_sare"],
    },
  },
];
