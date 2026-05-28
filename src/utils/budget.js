// Light budget model for a single-base family trip. No tiers — just the real
// cost drivers: lodging nights, activity tickets (per person), food per day,
// and fuel derived from the base's drive distances. Every default is editable
// in the budget view via `overrides`.

export const BUDGET_DEFAULTS = {
  foodPerDay: 35,        // €/persona/día (compra + alguna comida fuera)
  fuelPricePerL: 1.85,   // €/litro (gasóleo/gasolina Francia, verano)
  consumption: 7,        // L/100 km
  includeHomeTrip: true, // contar el viaje de ida y vuelta desde casa
};

const round = (n) => Math.round(n);

// args:
//   base               → chosen base object (from data/bases.js) or null
//   nights             → number of nights
//   travelers, cars    → headcount
//   selectedActivities → array of activity objects to charge tickets for
//   placeDistances     → array of { km } round-trip drive legs (one per place)
//   overrides          → partial of BUDGET_DEFAULTS + { pricePerNight }
export const computeBudget = ({
  base,
  nights,
  travelers,
  cars,
  selectedActivities = [],
  placeDistances = [],
  overrides = {},
}) => {
  const o = { ...BUDGET_DEFAULTS, ...overrides };
  const tripDays = nights + 1;
  const pricePerNight = overrides.pricePerNight ?? base?.pricePerNight ?? 0;

  const lodging = pricePerNight * nights;

  const activities =
    selectedActivities.reduce((sum, a) => sum + (a.price || 0), 0) * travelers;

  const food = o.foodPerDay * travelers * tripDays;

  // Local day-trip km: each selected place is a round trip from the base.
  const localKm = placeDistances.reduce((sum, d) => sum + (d.km || 0) * 2, 0);
  const homeKm = o.includeHomeTrip && base?.fromHome ? base.fromHome.km * 2 : 0;
  const liters = ((localKm + homeKm) / 100) * o.consumption;
  // Multiple cars driving the same route burn fuel per car.
  const fuel = liters * o.fuelPricePerL * Math.max(1, cars);

  const lines = [
    {
      key: "lodging",
      label: "Alojamiento",
      amount: round(lodging),
      detail: `${pricePerNight} €/noche × ${nights} noches`,
    },
    {
      key: "food",
      label: "Comida",
      amount: round(food),
      detail: `${o.foodPerDay} €/persona/día × ${travelers} pers × ${tripDays} días`,
    },
    {
      key: "activities",
      label: "Actividades (entradas)",
      amount: round(activities),
      detail:
        selectedActivities.length === 0
          ? "Sin actividades de pago seleccionadas"
          : `${selectedActivities.filter((a) => a.price > 0).length} de pago × ${travelers} pers`,
    },
    {
      key: "fuel",
      label: "Combustible",
      amount: round(fuel),
      detail: [
        `${round(localKm + homeKm)} km ida/vuelta`,
        `${o.consumption} L/100`,
        `${o.fuelPricePerL} €/L`,
        cars > 1 ? `× ${cars} coches` : "",
        o.includeHomeTrip ? "" : "(sin viaje de casa)",
      ].filter(Boolean).join(" · "),
    },
  ];

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  const perPerson = travelers > 0 ? round(total / travelers) : total;

  return { lines, total, perPerson, tripDays };
};
