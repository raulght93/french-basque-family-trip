// Centralised "things the family should notice" calculator. Pure derivation
// from current state + a few module data sources. Returns an array of
// { id, severity: "warn"|"info", icon, title, detail } that the AlertsPill
// in the Header renders.

import { BASES, baseById } from "../data/bases.js";
import { ACTIVITIES, activityById } from "../data/activities.js";
import { AUTO_ITEMS } from "../data/checklistItems.js";
import { daysUntil } from "./dates.js";
import { STORAGE_PREFIX } from "../hooks/useLocalStorage.js";

const HEAVY_DRIVE_MIN = 180;
const DEADLINE_WARN_DAYS = 14;
const DEADLINE_INFO_DAYS = 30;

// Read the checklist's `checked` map directly from localStorage so we don't
// have to thread the checklist hook through the header.
const readCheckedMap = () => {
  try {
    if (!globalThis.localStorage) return {};
    const raw = globalThis.localStorage.getItem(`${STORAGE_PREFIX}checklist_checked`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const severityFor = (daysLeft) => {
  if (daysLeft <= DEADLINE_WARN_DAYS) return "warn";
  if (daysLeft <= DEADLINE_INFO_DAYS) return "info";
  return null;
};

export const computeTripAlerts = (state) => {
  if (!state) return [];
  const out = [];

  // Identity not picked yet.
  if (!state.selfMemberId) {
    out.push({
      id: "identity",
      severity: "warn",
      icon: "👤",
      title: "Elige quién eres",
      detail: "Sin identidad tus votos no se atribuyen a nadie.",
    });
  }

  // Base decision.
  if (!state.baseId) {
    const soonest = BASES
      .map((b) => ({ b, d: daysUntil(b.bookingDeadline) }))
      .filter((x) => x.d >= 0)
      .sort((a, b) => a.d - b.d)[0];
    out.push({
      id: "base_unset",
      severity: soonest && soonest.d <= DEADLINE_WARN_DAYS ? "warn" : "info",
      icon: "🏠",
      title: "Sin base elegida",
      detail: soonest
        ? `Próxima caducidad: ${soonest.b.name} en ${soonest.d} día${soonest.d === 1 ? "" : "s"}.`
        : undefined,
    });
  } else {
    const base = baseById(state.baseId);
    if (base?.bookingDeadline) {
      const d = daysUntil(base.bookingDeadline);
      const sev = d >= 0 ? severityFor(d) : null;
      if (sev) {
        out.push({
          id: "base_deadline",
          severity: sev,
          icon: "🏠",
          title: `${base.name}: cancela en ${d} día${d === 1 ? "" : "s"}`,
          detail: `Si quieres anularla, hazlo antes del ${base.bookingDeadline}.`,
        });
      }
    }
  }

  // Popular votes that nobody scheduled. Votes are advisory now (they no
  // longer pull into the budget or the comparator) so we surface them
  // explicitly here. Threshold: 2+ voters on an activity not in the
  // itinerary.
  if (state.votes && state.itinerary) {
    const scheduledIds = new Set();
    Object.values(state.itinerary).forEach((list) => (list || []).forEach((id) => scheduledIds.add(id)));
    const popular = ACTIVITIES
      .map((a) => ({ a, votes: (state.votes[a.id] || []).length }))
      .filter(({ a, votes }) => votes >= 2 && !scheduledIds.has(a.id))
      .sort((x, y) => y.votes - x.votes);
    if (popular.length > 0) {
      const top = popular.slice(0, 3).map(({ a, votes }) => `«${a.name}» (${votes}👤)`).join(", ");
      const more = popular.length > 3 ? ` y ${popular.length - 3} más` : "";
      out.push({
        id: "popular_unscheduled",
        severity: "info",
        icon: "🎯",
        title: `${popular.length} actividad${popular.length === 1 ? "" : "es"} con votos sin programar`,
        detail: `${top}${more}. Considera meter alguna en el itinerario.`,
      });
    }
  }

  // Capacity: roughly 5 plazas por coche (4 + conductor) con maletas. Si la
  // familia entera no cabe en los coches actuales, lo flagueamos.
  const SEATS_PER_CAR = 5;
  if (state.cars && state.members?.length) {
    const needed = Math.ceil(state.members.length / SEATS_PER_CAR);
    if (state.cars < needed) {
      out.push({
        id: "cars_capacity",
        severity: "warn",
        icon: "🚗",
        title: `${state.cars} coche${state.cars === 1 ? "" : "s"} para ${state.members.length} personas`,
        detail: `Contando 5 plazas por coche con maletas, harían falta al menos ${needed}.`,
      });
    }
  }

  // Heavy drive days (one per offending day). Drive counted per UNIQUE
  // place visited so a day with multiple activities in the same town
  // doesn't double-count.
  const base = state.baseId ? baseById(state.baseId) : null;
  if (base && state.itinerary) {
    for (const [k, list] of Object.entries(state.itinerary)) {
      let drive = 0;
      const seenPlaces = new Set();
      for (const actId of list || []) {
        const a = activityById(actId);
        if (!a) continue;
        if (seenPlaces.has(a.placeId)) continue;
        seenPlaces.add(a.placeId);
        const d = base.distances?.[a.placeId];
        if (d) drive += d.min * 2;
      }
      if (drive > HEAVY_DRIVE_MIN) {
        const h = Math.floor(drive / 60);
        const m = drive % 60;
        out.push({
          id: `heavy:${k}`,
          severity: "info",
          icon: "🚗",
          title: `Día ${Number(k) + 1} con mucho coche`,
          detail: `${h}h${m ? ` ${m}min` : ""} de conducción ida-y-vuelta desde la base.`,
        });
      }
    }
  }

  // Checklist deadlines on items still unchecked.
  const checked = readCheckedMap();
  for (const item of AUTO_ITEMS) {
    if (!item.deadline) continue;
    if (checked[item.id]) continue;
    const d = daysUntil(item.deadline);
    if (d < 0 || d > DEADLINE_INFO_DAYS) continue;
    out.push({
      id: `cl:${item.id}`,
      severity: severityFor(d),
      icon: "⏳",
      title: item.label,
      detail: `Caduca en ${d} día${d === 1 ? "" : "s"} (${item.deadline}).`,
    });
  }

  return out;
};

// Warnings first, then info, then alphabetical by title to keep the list
// stable across renders.
const ORDER = { warn: 0, info: 1 };
export const sortedAlerts = (alerts) =>
  [...alerts].sort((a, b) => {
    const da = (ORDER[a.severity] ?? 9) - (ORDER[b.severity] ?? 9);
    if (da !== 0) return da;
    return (a.title || "").localeCompare(b.title || "");
  });
