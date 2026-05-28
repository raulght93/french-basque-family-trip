// Typical food and drink of the French Basque country. Pure data — rendered
// in IntroPanel "Cocina vasca". Images are Wikimedia Commons 500px (the lightbox
// upgrades them to 1280px on click). A couple of dishes have no good Wikipedia
// thumbnail and fall back to the food-zone gradient; that's OK visually.

const WIKI = "https://upload.wikimedia.org/wikipedia/commons/thumb";

export const FOODS = [
  {
    id: "jamon_bayona",
    name: "Jambon de Bayonne",
    desc: "Jamón curado al sal de Salies-de-Béarn. Suave, dulce y muy aromático; se sirve fino en lonchas o sobre tostada con tomate.",
    img: `${WIKI}/7/7d/Jambon_de_Bayonne..jpg/500px-Jambon_de_Bayonne..jpg`,
  },
  {
    id: "chocolate_bayona",
    name: "Chocolate de Bayona",
    desc: "Bayonne fue la primera ciudad chocolatera de Francia (s. XVII). Pasta de cacao molida a la antigua, intensa; pruébalo en una chocolaterie del Petit Bayonne.",
    img: `${WIKI}/6/64/00_Ganach%C3%A9_de_chocolate.jpg/500px-00_Ganach%C3%A9_de_chocolate.jpg`,
  },
  {
    id: "gateau_basque",
    name: "Gâteau basque (pastel vasco)",
    desc: "Tarta crujiente rellena de crema pastelera o de cerezas negras de Itxassou. Postre por excelencia de la zona.",
    img: `${WIKI}/e/ee/G%C3%A2teau_basque_02.jpg/500px-G%C3%A2teau_basque_02.jpg`,
  },
  {
    id: "axoa",
    name: "Axoa de ternera",
    desc: "Picadillo de ternera guisado con pimientos verdes, cebolla y pimiento de Espelette. Plato casero típico de Espelette y los pueblos de montaña.",
    img: `${WIKI}/4/45/Restaurant_la_Vieille-Auberge_-_Chez_D%C3%A9d%C3%A9_%28Saint-Jean-Pied-de-Port%29_-_axoa_d%C3%A9coup%C3%A9.jpg/500px-Restaurant_la_Vieille-Auberge_-_Chez_D%C3%A9d%C3%A9_%28Saint-Jean-Pied-de-Port%29_-_axoa_d%C3%A9coup%C3%A9.jpg`,
  },
  {
    id: "ossau_iraty",
    name: "Ossau-Iraty",
    desc: "Queso de oveja AOP de los Pirineos vascos y bearneses. Curado, terso, ligeramente dulzón; clásico con confitura de cereza negra.",
    img: `${WIKI}/1/1a/Fromages_Ossau-Iraty_003.jpg/500px-Fromages_Ossau-Iraty_003.jpg`,
  },
  {
    id: "piperade",
    name: "Pipérade",
    desc: "Pisto vasco a base de pimientos, tomate, cebolla y pimiento de Espelette. Se sirve solo, con huevo cuajado o como guarnición del jamón.",
    img: `${WIKI}/d/d8/Piperade_01.jpg/500px-Piperade_01.jpg`,
  },
  {
    id: "ttoro",
    name: "Ttoro",
    desc: "Sopa-cazuela de pescadores de San Juan de Luz: merluza, rape, mejillones, langostinos y caldo de pescado con tomate y guindilla.",
    img: `${WIKI}/5/52/Ttoro.jpg/500px-Ttoro.jpg`,
  },
  {
    id: "piment_espelette",
    name: "Piment d'Espelette",
    desc: "El pimiento rojo AOP de Espelette, secado al sol en las fachadas. Picante suave y aromático; el «pimentón» del País Vasco francés.",
    img: `${WIKI}/5/58/France-Piment_d%27Espelette-2005-08-05.jpg/500px-France-Piment_d%27Espelette-2005-08-05.jpg`,
  },
  {
    id: "pintxos",
    name: "Pintxos (Hondarribia)",
    desc: "Cuando crucéis a Hondarribia, recorred los bares de la Marina y de la calle San Pedro: pintxos en barra, txakoli o sidra.",
    img: `${WIKI}/4/46/TapasenBarcelona.JPG/500px-TapasenBarcelona.JPG`,
  },
  {
    id: "sagardoa",
    name: "Sidra (Sagardoa)",
    desc: "La sidra natural vasca, escanciada del kupela. Acompaña perfecto al chuletón y al queso. Tradición compartida con Gipuzkoa al otro lado de la frontera.",
    img: `${WIKI}/c/ca/Sagarrak_zanpatzen.jpg/500px-Sagarrak_zanpatzen.jpg`,
  },
];
