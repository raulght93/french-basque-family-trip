// Activity catalogue with the practical info that actually drives decisions:
// price, opening hours (August variant where the proposal gives it), duration,
// whether it needs booking, and — important for this family — accessibility.
//
// `placeId`     → links to data/places.js (also gives default lat/lng).
// `type`        → glyph + colour bucket (see TYPE_META below).
// `price`       → €/persona; 0 = gratis.
// `durationMin` → rough on-site time, for the day planner.
// `access`      → "full" | "partial" | "none".
// `accessNote`  → the concrete caveat (steps, terrain, who to call).
// `booking`     → true if it should be reserved ahead.
// `lat/lng`     → optional override; defaults to the place coords.

const WIKI = "https://upload.wikimedia.org/wikipedia/commons/thumb";

export const ACTIVITIES = [
  {
    id: "tren_larrun",
    name: "Tren de La Rhune (Larrún)",
    placeId: "sare",
    type: "tren",
    price: 26,
    hours: "8:20–17:30 (agosto)",
    durationMin: 150,
    access: "partial",
    accessNote:
      "El tren de cremallera es accesible, pero la cima (905 m) es terreno " +
      "irregular. La subida dura 35 min (9 km/h); parada de 1h20 arriba.",
    booking: true,
    bookingNote: "Reservar online: se agota en agosto. Excursión total ~2,5 h.",
    desc:
      "Antiguo tren de cremallera hasta la cima del Larrún, con vistas " +
      "espectaculares a los Pirineos y a la frontera. 26 €/persona.",
    img: `${WIKI}/2/27/La_Rhune_Neige.jpg/500px-La_Rhune_Neige.jpg`,
  },
  {
    id: "cuevas_sare",
    name: "Cuevas de Sare (Grottes de Sare)",
    placeId: "sare",
    type: "cueva",
    price: 10,
    hours: "9:30–19:30",
    durationMin: 60,
    access: "partial",
    accessNote:
      "Galería inferior accesible con pasarelas metálicas. Para el nivel " +
      "superior hay 40 escalones de subida y 30 de bajada. Movilidad reducida: " +
      "llamar dos días antes por la mañana (se quedan con guías en el nivel inferior).",
    booking: true,
    bookingNote: "Visita guiada con luz y sonido, ~1 h (45 min dentro). 900 m en dos galerías.",
    desc:
      "Recorrido guiado de 900 m repartidos en dos galerías, con espectáculo " +
      "de luz y sonido. 10 €/persona.",
    img: `${WIKI}/2/2c/Grottes_de_Sare.jpg/500px-Grottes_de_Sare.jpg`,
  },
  {
    id: "ortillopitz",
    name: "Casa vasca de Ortillopitz",
    placeId: "sare",
    type: "casa",
    price: 6,
    hours: "Visitas guiadas",
    durationMin: 75,
    access: "partial",
    accessNote: "Caserío del s. XVII con escaleras y suelos originales; no totalmente accesible.",
    booking: false,
    bookingNote: "A 2,4 km de Sare.",
    desc:
      "Visita a una casa vasca tradicional para ver cómo era el día a día. " +
      "6 €/persona.",
    lat: 43.298,
    lng: -1.576,
  },
  {
    id: "iglesia_sare",
    name: "Iglesia de San Martín",
    placeId: "sare",
    type: "monumento",
    price: 0,
    hours: "Horario de culto",
    durationMin: 30,
    access: "full",
    accessNote: "Acceso a pie de calle a la nave principal.",
    booking: false,
    desc:
      "Iglesia con tres galerías de madera y una torre de cinco pisos. Junto al " +
      "reloj, una frase en euskera: «todas las horas golpean al hombre, la última " +
      "lo envía a la tumba».",
  },
  {
    id: "casco_sare",
    name: "Casco histórico y mercado de Sare",
    placeId: "sare",
    type: "pueblo",
    price: 0,
    hours: "Mercado: viernes 16:30–20:30 (agosto)",
    durationMin: 90,
    access: "full",
    accessNote: "Calles llanas y empedradas en el centro; plaza del frontón accesible.",
    booking: false,
    desc:
      "Paseo por las calles del centro, el frontón en la plaza y las casitas de " +
      "estilo neovasco. Mercado los viernes por la tarde en agosto.",
  },
  {
    id: "pottoks_bleus",
    name: "Paseo de los Pottoks Bleus",
    placeId: "zugarramurdi",
    type: "naturaleza",
    price: 0,
    hours: "A cualquier hora (sendero)",
    durationMin: 180,
    access: "none",
    accessNote: "Sendero de montaña por el Valle de Xareta; no apto para movilidad reducida.",
    booking: false,
    desc:
      "Sendero que recorre Sare, Ainhoa (Francia) y Zugarramurdi, Urdax " +
      "(Navarra): el Valle de Xareta, tierra de brujas y contrabandistas, con " +
      "sus ponis azules (pottoks).",
  },
  {
    id: "cuevas_zugarramurdi",
    name: "Cuevas de las Brujas (Zugarramurdi)",
    placeId: "zugarramurdi",
    type: "cueva",
    price: 5,
    hours: "10:00–19:00 (verano)",
    durationMin: 60,
    access: "partial",
    accessNote: "Gran cueva natural con sendero; tramos con desnivel.",
    booking: false,
    desc:
      "La cueva de los akelarres. Junto al Museo de las Brujas. Una escapada " +
      "fácil al lado navarro del Valle de Xareta.",
    img: `${WIKI}/c/ca/Cuevas_de_Zugarramurdi.jpg/500px-Cuevas_de_Zugarramurdi.jpg`,
  },
  {
    id: "espelette_pueblo",
    name: "Espelette: pimientos y casco",
    placeId: "espelette",
    type: "pueblo",
    price: 0,
    hours: "Todo el día",
    durationMin: 90,
    access: "full",
    accessNote: "Casco compacto y llano; fachadas con ristras de pimiento.",
    booking: false,
    desc:
      "Pueblo de los pimientos colgados al sol. Río Latsa, iglesia de Saint-" +
      "Étienne y Château des Barons.",
  },
  {
    id: "ainhoa_pueblo",
    name: "Ainhoa: casas de entramado",
    placeId: "ainhoa",
    type: "pueblo",
    price: 0,
    hours: "Todo el día",
    durationMin: 60,
    access: "full",
    accessNote: "Calle principal llana entre casas de entramado y contraventanas de colores.",
    booking: false,
    desc:
      "Uno de los pueblos más bellos de Francia, a orillas del Nivelle. Casas " +
      "de entramado de madera y origen jacobeo.",
  },
  {
    id: "bayonne_ciudad",
    name: "Bayona: catedral, chocolate y jamón",
    placeId: "bayonne",
    type: "ciudad",
    price: 0,
    hours: "Todo el día",
    durationMin: 180,
    access: "full",
    accessNote: "Casco accesible salvo algunas calles empedradas del Petit Bayonne.",
    booking: false,
    desc:
      "Catedral Sainte-Marie, claustro gótico, las galerías del Petit Bayonne y " +
      "la tradición del chocolate y el jamón de Bayona.",
  },
  {
    id: "biarritz_costa",
    name: "Biarritz: Grande Plage y Rocher de la Vierge",
    placeId: "biarritz",
    type: "costa",
    price: 0,
    hours: "Todo el día",
    durationMin: 180,
    access: "partial",
    accessNote:
      "Paseo marítimo y Grande Plage accesibles; el Rocher de la Vierge tiene " +
      "pasarela con escalones.",
    booking: false,
    desc:
      "Villa elegante del surf europeo: Grande Plage, el Rocher de la Vierge, " +
      "el faro y la Côte des Basques.",
  },
  {
    id: "sanjuan_costa",
    name: "San Juan de Luz: bahía e iglesia",
    placeId: "sanjuan",
    type: "costa",
    price: 0,
    hours: "Todo el día",
    durationMin: 150,
    access: "full",
    accessNote: "Playa de bahía protegida, paseo llano; la más cómoda con familia.",
    booking: false,
    desc:
      "Bahía tranquila y familiar, iglesia de Saint-Jean-Baptiste (boda de " +
      "Luis XIV), Maison Louis XIV y casco de casas de armador.",
  },
  {
    id: "sjpp_pueblo",
    name: "Saint-Jean-Pied-de-Port",
    placeId: "sjpp",
    type: "pueblo",
    price: 0,
    hours: "Todo el día",
    durationMin: 120,
    access: "partial",
    accessNote: "Ciudadela y calle de la muralla en cuesta y empedrado.",
    booking: false,
    desc:
      "Ciudadela y última etapa francesa del Camino de Santiago, a orillas del " +
      "Nive. Casco empedrado entre murallas.",
  },
  {
    id: "labastide_pueblo",
    name: "La Bastide-Clairence",
    placeId: "labastide",
    type: "pueblo",
    price: 0,
    hours: "Todo el día",
    durationMin: 90,
    access: "full",
    accessNote: "Plaza con soportales y calle principal llana.",
    booking: false,
    desc:
      "Bastida del s. XIV, otro de los pueblos más bellos de Francia. Casas " +
      "blancas con vigas rojas y verdes, soportales y talleres de artesanos.",
  },
  {
    id: "ascain_pueblo",
    name: "Ascain, a los pies de La Rhune",
    placeId: "ascain",
    type: "pueblo",
    price: 0,
    hours: "Todo el día",
    durationMin: 60,
    access: "full",
    accessNote: "Plaza, frontón y puente llanos; paseo cómodo junto al Nivelle.",
    booking: false,
    desc:
      "Pueblo labortano tranquilo a 10 min de Sare, base del ascenso a La Rhune. " +
      "Frontón, iglesia y puente romano sobre el Nivelle.",
  },
  {
    id: "saintpee_lago",
    name: "Lago de Saint-Pée (baño)",
    placeId: "saintpee",
    type: "naturaleza",
    price: 0,
    hours: "Baño vigilado en julio-agosto",
    durationMin: 150,
    access: "full",
    accessNote: "Orilla y zona de césped llanas; baño acotado apto para niños.",
    booking: false,
    desc:
      "Gran lago de baño con zona vigilada, barcas y merenderos. Plan de tarde " +
      "refrescante y muy familiar, a un cuarto de hora de Sare.",
  },
  {
    id: "villa_arnaga",
    name: "Villa Arnaga (Cambo-les-Bains)",
    placeId: "cambo",
    type: "casa",
    price: 10,
    hours: "10:00–19:00 (verano)",
    durationMin: 90,
    access: "partial",
    accessNote: "Jardines a la francesa accesibles; la casa-museo tiene escaleras.",
    booking: false,
    desc:
      "Casa-museo y espectaculares jardines de Edmond Rostand (autor de Cyrano " +
      "de Bergerac). Una de las visitas culturales más bonitas de la zona.",
  },
  {
    id: "hendaye_playa",
    name: "Playa de Hendaya",
    placeId: "hendaye",
    type: "costa",
    price: 0,
    hours: "Todo el día",
    durationMin: 180,
    access: "full",
    accessNote: "3 km de arena llana y paseo; la playa familiar más cómoda.",
    booking: false,
    desc:
      "La playa más larga y tendida de la costa vasca francesa, ideal con niños. " +
      "Frente a Hondarribia, en plena frontera.",
  },
  {
    id: "guethary_pueblo",
    name: "Guéthary, balcón al mar",
    placeId: "guethary",
    type: "costa",
    price: 0,
    hours: "Todo el día",
    durationMin: 60,
    access: "partial",
    accessNote: "Mirador del puerto accesible; bajada a las calas con escaleras.",
    booking: false,
    desc:
      "Encantador pueblo de pescadores y surfistas con mirador sobre el " +
      "Cantábrico y antiguo puerto ballenero. Parada perfecta de costa.",
  },
  {
    id: "isturitz_cuevas",
    name: "Cuevas de Isturitz y Oxocelhaya",
    placeId: "isturitz",
    type: "cueva",
    price: 11,
    hours: "Visitas guiadas (verano)",
    durationMin: 75,
    access: "partial",
    accessNote: "Recorrido subterráneo con escalones; no apto para movilidad reducida.",
    booking: true,
    bookingNote: "Visita guiada de prehistoria; muy cerca de Chez Lucas (Mendiondo).",
    desc:
      "Grutas prehistóricas con grabados, arte rupestre y concreciones. La gran " +
      "baza cultural del interior, junto a la base de Chez Lucas.",
  },
  {
    id: "hondarribia_casco",
    name: "Hondarribia: casco y Marina",
    placeId: "hondarribia",
    type: "ciudad",
    price: 0,
    hours: "Todo el día",
    durationMin: 150,
    access: "partial",
    accessNote: "Casco medieval en cuesta y empedrado; la Marina es más llana.",
    booking: false,
    desc:
      "Villa amurallada de Gipuzkoa: puerta de Santa María, castillo de Carlos V " +
      "y el barrio de la Marina con balcones de colores y pintxos. Cruzando la " +
      "bahía desde Hendaya.",
  },
  {
    id: "itxassou_pasroland",
    name: "Pas de Roland (Itxassou)",
    placeId: "itxassou",
    type: "naturaleza",
    price: 0,
    hours: "A cualquier hora (sendero)",
    durationMin: 120,
    access: "none",
    accessNote: "Sendero junto al río Nive; terreno irregular, no accesible.",
    booking: false,
    desc:
      "Roca legendaria horadada (la abrió Roldán de una patada, según la leyenda) " +
      "sobre el Nive, en el pueblo de las cerezas. Paseo verde y fresco.",
  },
];

export const activityById = (id) => ACTIVITIES.find((a) => a.id === id) || null;
export const activitiesForPlace = (placeId) =>
  ACTIVITIES.filter((a) => a.placeId === placeId);

// Visual + label metadata per activity type.
export const TYPE_META = {
  tren:       { glyph: "🚞", label: "Tren panorámico", bucket: "montana" },
  cueva:      { glyph: "🕳️", label: "Cueva", bucket: "montana" },
  casa:       { glyph: "🏡", label: "Casa / museo", bucket: "montana" },
  monumento:  { glyph: "⛪", label: "Monumento", bucket: "montana" },
  pueblo:     { glyph: "🏘️", label: "Pueblo", bucket: "montana" },
  naturaleza: { glyph: "🥾", label: "Naturaleza / senderismo", bucket: "montana" },
  ciudad:     { glyph: "🏙️", label: "Ciudad", bucket: "costa" },
  costa:      { glyph: "🏖️", label: "Costa", bucket: "costa" },
};

export const ACCESS_META = {
  full:    { glyph: "♿", label: "Accesible", color: "success" },
  partial: { glyph: "♿", label: "Parcialmente accesible", color: "warning" },
  none:    { glyph: "⛰️", label: "No accesible", color: "danger" },
};
