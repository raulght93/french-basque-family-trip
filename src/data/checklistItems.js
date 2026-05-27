// Shared checklist. Flat list of auto items grouped by category. Items with a
// `deadline` (ISO yyyy-mm-dd) surface a countdown / overdue badge in the UI —
// the booking cancellation dates from the proposal are the critical ones.
//
// `cars: true` flags items relevant to travelling in more than one car.

export const CATEGORIES = [
  { id: "decision", label: "Decisiones y reservas", glyph: "📌" },
  { id: "documentos", label: "Documentos", glyph: "🪪" },
  { id: "coche", label: "Coche y ruta", glyph: "🚗" },
  { id: "equipaje", label: "Equipaje", glyph: "🎒" },
  { id: "casa", label: "En destino", glyph: "🏠" },
];

export const AUTO_ITEMS = [
  // ── Decisiones y reservas (con deadlines reales del documento) ──
  {
    id: "decidir_base",
    category: "decision",
    label: "Decidir base: Maison (Sare) o Chez Lucas (Mendiondo)",
    note: "Usa el comparador de bases. Urruti (Zilbeti) está descartada.",
    deadline: "2026-07-17",
  },
  {
    id: "confirmar_maison",
    category: "decision",
    label: "Confirmar o cancelar Maison (Sare)",
    note: "Reservada. Cancelación gratuita hasta el 17 de julio.",
    deadline: "2026-07-17",
  },
  {
    id: "confirmar_chezlucas",
    category: "decision",
    label: "Confirmar o cancelar Chez Lucas (Mendiondo)",
    note: "Se paga ahora; cancelación hasta el 4 de agosto.",
    deadline: "2026-08-04",
  },
  {
    id: "reservar_tren_rhune",
    category: "decision",
    label: "Reservar el tren de La Rhune online",
    note: "Se agota en agosto. 26 €/persona.",
  },
  {
    id: "llamar_cuevas",
    category: "decision",
    label: "Llamar a las Cuevas de Sare si hay movilidad reducida",
    note: "Avisar dos días antes, por la mañana.",
  },
  {
    id: "reservar_restaurantes",
    category: "decision",
    label: "Reservar restaurantes top (cenas de agosto se llenan)",
  },

  // ── Documentos ──
  { id: "dni", category: "documentos", label: "DNI / pasaporte en vigor de todos" },
  { id: "tse", category: "documentos", label: "Tarjeta Sanitaria Europea (TSE) de cada uno" },
  { id: "seguro_viaje", category: "documentos", label: "Seguro de viaje / asistencia" },
  { id: "efectivo", category: "documentos", label: "Algo de efectivo en euros + tarjetas" },

  // ── Coche y ruta ──
  { id: "doc_coche", category: "coche", label: "Documentación del coche, ITV y seguro al día", cars: true },
  { id: "seguro_asistencia", category: "coche", label: "Asistencia en carretera con cobertura en Francia", cars: true },
  { id: "kit_coche", category: "coche", label: "Chaleco reflectante y triángulos (obligatorios en Francia)", cars: true },
  { id: "repartir_coches", category: "coche", label: "Repartir plazas y conductores entre coches", cars: true },
  { id: "peajes_combustible", category: "coche", label: "Plan de peajes y repostaje (autopista AP-8 / A63)", cars: true },
  { id: "navegador_offline", category: "coche", label: "Mapas offline / navegador con la zona descargada" },

  // ── Equipaje ──
  { id: "ropa_lluvia", category: "equipaje", label: "Chubasquero ligero (el clima atlántico es variable)" },
  { id: "calzado_comodo", category: "equipaje", label: "Calzado cómodo para empedrados y sendero" },
  { id: "banador", category: "equipaje", label: "Bañador y toalla (playas de la costa)" },
  { id: "proteccion_solar", category: "equipaje", label: "Protección solar y gorra (agosto)" },
  { id: "mochila_dia", category: "equipaje", label: "Mochila de día + botella de agua" },
  // Mismo enchufe (tipo E/F, 230 V): no hace falta adaptador.

  // ── En destino ──
  { id: "compra_llegada", category: "casa", label: "Compra de primera necesidad al llegar a la casa" },
  { id: "horarios_mercado", category: "casa", label: "Apuntar el mercado de Sare (viernes tarde, agosto)" },
  { id: "contacto_anfitrion", category: "casa", label: "Guardar el contacto del anfitrión y la dirección" },
];
