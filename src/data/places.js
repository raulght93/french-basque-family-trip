// Towns / villages of the trip. Pure data, no React.
//
// `zone`: "montana" (interior Pyrenean villages) | "costa" (Atlantic coast)
//         | "navarra" (the Spanish side of the Xareta valley — visited, not
//         slept in, since the Spanish base was discarded).
// `country`: "FR" | "ES" — drives a small flag chip in the UI.
// `img` is a Wikimedia Commons 500px thumbnail (see CLAUDE.md image rules).
// If a URL ever 404s the UI falls back to a tinted gradient per zone via the
// shared <Img> component, so nothing looks broken.

const WIKI = "https://upload.wikimedia.org/wikipedia/commons/thumb";

export const PLACES = [
  {
    id: "sare",
    name: "Sare",
    zone: "montana",
    country: "FR",
    lat: 43.3107,
    lng: -1.5815,
    desc:
      "Uno de los pueblos más bellos de Francia, rodeado por los Pirineos. " +
      "Iglesia de San Martín con tres galerías de madera, frontón en la plaza " +
      "y casitas de estilo neovasco. Base de salida del tren de La Rhune.",
    img: `${WIKI}/b/b4/Sare_-_%C3%89glise_Saint-Martin_-_3.jpg/500px-Sare_-_%C3%89glise_Saint-Martin_-_3.jpg`,
  },
  {
    id: "ainhoa",
    name: "Ainhoa",
    zone: "montana",
    country: "FR",
    lat: 43.3061,
    lng: -1.4997,
    desc:
      "Uno de los pueblos más bellos de Francia, a la ribera del río Nivelle. " +
      "Casas de entramado de madera y contraventanas de colores. Surgió como " +
      "lugar de abastecimiento y hospedaje del Camino de Santiago.",
    img: `${WIKI}/3/32/A%C3%AFnhoa.jpg/500px-A%C3%AFnhoa.jpg`,
  },
  {
    id: "espelette",
    name: "Espelette",
    zone: "montana",
    country: "FR",
    lat: 43.3436,
    lng: -1.4472,
    desc:
      "Pintoresco pueblo famoso por los pimientos colgados al sol en sus " +
      "fachadas. Río Latsa, iglesia de Saint-Étienne y Château des Barons.",
    img: `${WIKI}/d/d6/Espelette_-_Ch%C3%A2teau.jpg/500px-Espelette_-_Ch%C3%A2teau.jpg`,
  },
  {
    id: "sjpp",
    name: "Saint-Jean-Pied-de-Port",
    zone: "montana",
    country: "FR",
    lat: 43.1635,
    lng: -1.2366,
    desc:
      "Última etapa francesa del Camino de Santiago antes de cruzar los " +
      "Pirineos. Ciudadela, murallas y casco empedrado a orillas del Nive.",
    img: `${WIKI}/0/04/Saint-Jean-Pied-de-Port.jpg/500px-Saint-Jean-Pied-de-Port.jpg`,
  },
  {
    id: "labastide",
    name: "La Bastide-Clairence",
    zone: "montana",
    country: "FR",
    lat: 43.4300,
    lng: -1.2700,
    desc:
      "Bastida del s. XIV, otro de los pueblos más bellos de Francia. " +
      "Soportales, casas blancas con vigas rojas y verdes. Muy cerca de Chez Lucas.",
    img: `${WIKI}/7/7c/LBC_Place_de_la_mairie.jpg/500px-LBC_Place_de_la_mairie.jpg`,
  },
  {
    id: "bayonne",
    name: "Bayona",
    zone: "costa",
    country: "FR",
    lat: 43.4929,
    lng: -1.4748,
    desc:
      "Capital cultural del País Vasco francés: catedral Sainte-Marie, el " +
      "Petit Bayonne, chocolate artesano y jamón de Bayona. Confluencia del " +
      "Nive y el Adur.",
    img: `${WIKI}/3/39/Bayonne-Centre_historique-20130811.jpg/500px-Bayonne-Centre_historique-20130811.jpg`,
  },
  {
    id: "biarritz",
    name: "Biarritz",
    zone: "costa",
    country: "FR",
    lat: 43.4832,
    lng: -1.5586,
    desc:
      "Elegante villa de surf y baño. Grande Plage, Rocher de la Vierge, faro " +
      "y la Côte des Basques. Cuna del surf europeo.",
    img: `${WIKI}/c/c7/Biarritz_vue_g%C3%A9n%C3%A9rale.jpg/500px-Biarritz_vue_g%C3%A9n%C3%A9rale.jpg`,
  },
  {
    id: "sanjuan",
    name: "San Juan de Luz",
    zone: "costa",
    country: "FR",
    lat: 43.3880,
    lng: -1.6623,
    desc:
      "Bahía protegida con playa familiar y tranquila. Iglesia Saint-Jean-" +
      "Baptiste (boda de Luis XIV), Maison Louis XIV y un casco animado de " +
      "casas de armador.",
    img: `${WIKI}/d/d5/France_Aquitaine_Pyrenees_Atlantiques_Saint-Jean-de-Luz_01.JPG/500px-France_Aquitaine_Pyrenees_Atlantiques_Saint-Jean-de-Luz_01.JPG`,
  },
  {
    id: "zugarramurdi",
    name: "Zugarramurdi",
    zone: "navarra",
    country: "ES",
    lat: 43.2680,
    lng: -1.5500,
    desc:
      "Pueblo navarro de las brujas (akelarres). Cuevas de Zugarramurdi y " +
      "museo. Forma el Valle de Xareta junto a Sare, Ainhoa y Urdax.",
    img: `${WIKI}/9/92/Zugarramurdi._Euskal_Herria.jpg/500px-Zugarramurdi._Euskal_Herria.jpg`,
  },
  {
    id: "urdax",
    name: "Urdax (Urdazubi)",
    zone: "navarra",
    country: "ES",
    lat: 43.2820,
    lng: -1.5010,
    desc:
      "Pueblo navarro del Valle de Xareta. Cuevas de Ikaburu y monasterio de " +
      "San Salvador. Punto del sendero de los Pottoks Bleus.",
    img: `${WIKI}/c/c3/Urdazubi-05-03-20.JPG/500px-Urdazubi-05-03-20.JPG`,
  },
  {
    id: "ascain",
    name: "Ascain (Azkaine)",
    zone: "montana",
    country: "FR",
    lat: 43.3480,
    lng: -1.6240,
    desc:
      "Pueblo tranquilo a los pies de La Rhune, a un paso de Sare. Frontón, " +
      "puente romano sobre el Nivelle y casas labortanas. Buen punto de partida " +
      "para subir el monte a pie.",
    img: `${WIKI}/c/cb/Ascain_depuis_la_Rhune.jpg/500px-Ascain_depuis_la_Rhune.jpg`,
  },
  {
    id: "saintpee",
    name: "Saint-Pée-sur-Nivelle",
    zone: "montana",
    country: "FR",
    lat: 43.3470,
    lng: -1.5360,
    desc:
      "Pueblo con un gran lago de baño (plage du lac) con zona acotada, barcas " +
      "y merenderos: plan de tarde fácil y familiar entre Sare y Ainhoa.",
    img: `${WIKI}/1/1d/Saint-P%C3%A9e-sur-Nivelle_%28Pyr-Atl.%2C_Fr%29_%C3%A9glise_ext..JPG/500px-Saint-P%C3%A9e-sur-Nivelle_%28Pyr-Atl.%2C_Fr%29_%C3%A9glise_ext..JPG`,
  },
  {
    id: "cambo",
    name: "Cambo-les-Bains",
    zone: "montana",
    country: "FR",
    lat: 43.3580,
    lng: -1.3980,
    desc:
      "Villa termal con la espectacular Villa Arnaga, casa-museo y jardines a la " +
      "francesa de Edmond Rostand (autor de Cyrano). Ambiente elegante y verde.",
    img: `${WIKI}/9/97/Villa_Arnaga_%28Pyr%C3%A9n%C3%A9es_Atlantiques%29.jpg/500px-Villa_Arnaga_%28Pyr%C3%A9n%C3%A9es_Atlantiques%29.jpg`,
  },
  {
    id: "hendaye",
    name: "Hendaya (Hendaye)",
    zone: "costa",
    country: "FR",
    lat: 43.3710,
    lng: -1.7740,
    desc:
      "La playa más larga y llana de la costa vasca francesa (3 km de arena), " +
      "ideal con niños. En la frontera con España, frente a Hondarribia.",
    img: `${WIKI}/8/89/Hendaye_-_52496904880.jpg/500px-Hendaye_-_52496904880.jpg`,
  },
  {
    id: "guethary",
    name: "Guéthary",
    zone: "costa",
    country: "FR",
    lat: 43.4230,
    lng: -1.6090,
    desc:
      "Pueblo de pescadores y surfistas entre Biarritz y San Juan de Luz. " +
      "Mirador sobre el mar, antiguo puerto ballenero y calas con encanto.",
    img: `${WIKI}/b/b4/Gu%C3%A9thary_%28Pyr-Atl.%2C_Fr%29_Mairie_%2B_Fronton.JPG/500px-Gu%C3%A9thary_%28Pyr-Atl.%2C_Fr%29_Mairie_%2B_Fronton.JPG`,
  },
  {
    id: "isturitz",
    name: "Cuevas de Isturitz",
    zone: "montana",
    country: "FR",
    lat: 43.3580,
    lng: -1.2050,
    desc:
      "Grutas de Isturitz y Oxocelhaya, cuevas prehistóricas con grabados y " +
      "concreciones, muy cerca de Chez Lucas. Visita guiada bajo tierra.",
    img: null,
  },
  {
    id: "hondarribia",
    name: "Hondarribia",
    zone: "costa",
    country: "ES",
    lat: 43.3630,
    lng: -1.7930,
    desc:
      "Preciosa villa amurallada de Gipuzkoa: casco medieval, el barrio de " +
      "pescadores de la Marina con balcones de colores y pintxos. Cruzando la " +
      "bahía desde Hendaya.",
    img: `${WIKI}/7/75/Fontarrabie_depuis_Hendaye_2012.jpg/500px-Fontarrabie_depuis_Hendaye_2012.jpg`,
  },
  {
    id: "itxassou",
    name: "Itxassou (Itsasu)",
    zone: "montana",
    country: "FR",
    lat: 43.3300,
    lng: -1.4130,
    desc:
      "Pueblo de las cerezas, en plena naturaleza junto al Pas de Roland, una " +
      "roca legendaria horadada sobre el río Nive. Senderos y verdor.",
    img: `${WIKI}/5/54/Itxassou_Pas_de_Roland2.jpg/500px-Itxassou_Pas_de_Roland2.jpg`,
  },
];

export const placeById = (id) => PLACES.find((p) => p.id === id) || null;
export const placeName = (id) => placeById(id)?.name ?? id;

// Gradient fallback per zone (used when `img` is null).
export const ZONE_GRADIENT = {
  montana: "linear-gradient(135deg, #2E6B4F 0%, #1E3A2E 100%)",
  costa:   "linear-gradient(135deg, #2C6E8F 0%, #1B3B4B 100%)",
  navarra: "linear-gradient(135deg, #8A6D2F 0%, #4A3A18 100%)",
};

export const ZONE_LABEL = {
  montana: "Montaña",
  costa: "Costa",
  navarra: "Navarra (visita)",
};
