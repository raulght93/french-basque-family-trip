# CLAUDE.md — guía del proyecto

Documentación interna para futuras sesiones. Léela antes de tocar nada.

## Qué es

Aplicación React (Vite) de **una sola página**: guía de viaje + ayuda a la
decisión para un viaje **familiar de una semana** al **País Vasco francés**
(agosto 2026). Sin backend; todo el estado vive en React + localStorage.
Pensada para desplegar en Cloudflare Pages (igual que `africa-trip-planning`,
del que reutiliza la infraestructura).

A diferencia del viaje de África, **no es una ruta lineal**: es un **radio de
acción desde una base**. La decisión central es **qué alojamiento elegir**, y
la pieza estrella es el comparador de bases.

- Stack: React 18, Vite 6, lucide-react (apenas usado), **Leaflet + CARTO
  raster tiles** (mapa regional). Sin TypeScript, sin CSS externo (inline +
  tokens CSS vars). UI en español.
- Idioma: español (familia española, varios viajeros, varios coches,
  con atención a **accesibilidad / movilidad reducida**).

## Contexto del viaje (del PDF de la propuesta)

- 3 pueblos de montaña de referencia: **Sare**, Ainhoa, Espelette (+ SJPP,
  La Bastide). 3 de costa: Bayona, Biarritz, San Juan de Luz. Valle de Xareta
  (Zugarramurdi/Urdax, Navarra) para el paseo de los Pottoks Bleus.
- Bases candidatas: **Maison (Sare)** — reservada, cancela hasta 17 jul — y
  **Chez Lucas (Mendiondo)** — sin reservar, se paga ya, cancela hasta 4 ago.
  **Urruti (Zilbeti, España) está DESCARTADA** (no se alojan en España) — no
  aparece en los datos.
- La tabla de distancias del PDF está en `data/bases.js` (`distances`); los
  valores con `est: true` son estimados (no estaban en la tabla).

## Estructura

```
src/
├── BasqueGuide.jsx        ← Orquestador. Solo elige qué vista renderizar.
├── main.jsx
├── data/                  ← Datos puros. No React.
│   ├── places.js          ← Pueblos/ciudades (zona montana/costa/navarra, coords, desc).
│   ├── bases.js           ← Alojamientos + tabla de distancias + deadlines + precio est.
│   ├── activities.js      ← Catálogo con precio/horario/duración/accesibilidad/reserva.
│   └── checklistItems.js  ← AUTO_ITEMS por categoría, con deadlines y flag `cars`.
├── hooks/
│   ├── useLocalStorage.js ← Persistencia (prefijo `fbt_`).
│   ├── useResponsive.js, useTheme.js, useGoogleFonts.js, usePrintMode.js
│   ├── useChecklist.js    ← Filtra auto items (oculta `cars` si 1 coche) + custom.
│   ├── useShareableState.js ← Encode/decode estado en `?s=base64`.
│   └── useTripState.js    ← Fuente única de verdad (base, intereses, fechas, itinerario…).
├── utils/
│   ├── dates.js           ← addDays, formatDate, formatDow, daysUntil.
│   └── budget.js          ← computeBudget (alojamiento + comida + entradas + combustible).
├── styles/
│   └── tokens.js          ← Paleta LIGHT/DARK vasca (verde pino + rojo vasco + océano).
└── components/
    ├── Header.jsx, ActionsBar.jsx, ViewSwitcher.jsx, ErrorBoundary.jsx
    ├── BaseDecider.jsx    ← ⭐ Comparador de bases (la decisión central).
    ├── RegionMap.jsx      ← Mapa Leaflet (lazy). Bases + pueblos + líneas de radio.
    ├── ActivitiesPanel.jsx← Catálogo con filtros (zona/accesibilidad/reserva/marcadas).
    ├── ItineraryPanel.jsx ← Planificador día a día (asignar actividades).
    ├── ChecklistPanel.jsx ← Checklist con alertas de deadline + ítems custom.
    └── BudgetPanel.jsx    ← Datos del viaje (fechas/viajeros/coches) + presupuesto.
```

## Reglas de modificación

1. **No mezcles datos con UI.** Destinos → `data/places.js`; alojamientos y
   distancias → `data/bases.js`; actividades → `data/activities.js`.
2. **No metas lógica en `BasqueGuide.jsx`.** Solo conmuta vistas.
3. **El estado vive en `useTripState`.** Nuevo estado → añádelo ahí y exponlo.
   Si debe compartirse por URL, mételo también en `useShareableState` (claves
   cortas) y en el bootstrap de `useTripState`.
4. **Estilos vía `tokens.js`** (CSS vars). No hardcodees colores.
5. **Accesibilidad** en cualquier control nuevo: `aria-label`, `aria-pressed`
   en toggles, `aria-selected` en tabs, focus ring (`shadows.ring`).

## Modelo de votación (importante)

Es **una sola familia**, así que el interés es **por participante individual**:
- `state.members` = lista de participantes `{ id, name }` (renombrables,
  **default 8**, editable con add/remove en `MemberBar`). `state.activeMemberId`
  = quién vota ahora.
- **`state.travelers` es derivado = `members.length`** (no hay estado/stepper
  aparte): los participantes son la única fuente de verdad para el presupuesto.
  El `MemberBar` aparece en Decidir base, Actividades y Presupuesto.
- Defaults reales: `Antonio, Mariví, Jesús, María, Antonio Jr, Raúl, Ainoa,
  Elena` — renombrables.
- `state.votes` = `{ activityId: [memberId,...] }`. `toggleVote(actId, memberId)`,
  `hasVoted`, `voteCount`, `votersOf`.
- `isInterested(actId)` = `voteCount > 0` (alguien votó). Es el derivado que
  consumen los demás paneles:
  - **BaseDecider**: un lugar "interesa" si alguna de sus actividades tiene
    voto; puntúa cada base por tiempo total de conducción a esos lugares
    (sin votos → compara todos). Los chips de lugar reflejan el voto del
    miembro activo; muestran «N👤» votantes.
  - **RegionMap**: líneas de la base elegida a los lugares votados.
  - **Budget / PrintView**: entradas = actividades votadas ∪ del itinerario.
  - **Itinerary**: "marcadas sin asignar".
- En componentes que dependen del interés, el `useMemo` depende de
  `state.votes` (no de un array de interests).
- Compartido por URL: `members`, `activeMemberId`, `votes` (claves `m/am/v`).

## Modelo de precio (`utils/budget.js`)

`alojamiento (€/noche × noches) + comida (€/persona/día × viajeros × días) +
entradas (Σ precio actividades seleccionadas × viajeros) + combustible`.
Combustible = `(km_locales_ida_y_vuelta + km_casa) / 100 × consumo × €/L ×
nº coches`. Todo editable en BudgetPanel; `pricePerNight` por base es una
**estimación** (la propuesta no trae precios) — ajustar con la tarifa real.

## Cómo añadir cosas

- **Pueblo**: entrada en `data/places.js` (id, zone, country, lat/lng, desc) +
  añade su distancia a cada base en `data/bases.js` (`distances`).
- **Actividad**: entrada en `data/activities.js` (placeId, type, price, hours,
  durationMin, access, accessNote, booking…). El tipo necesita glyph en
  `TYPE_META`.
- **Ítem de checklist**: a `AUTO_ITEMS` en `data/checklistItems.js`; usa
  `deadline` (ISO) para que salga la alerta, `cars: true` si solo aplica con
  varios coches.

## Reglas para Claude

- **No añadas TypeScript** ni librerías de estilos (Tailwind/styled-…).
- **Nunca `npm run dev`** para "probar"; usa `npm run build` para verificar.
- **Textos editoriales**: no reescribas descripciones largas sin confirmar.

## Pendientes / backlog

✅ Hecho 2026-05-27: imágenes Wikimedia 500px (places + 3 activities) con
componente `<Img>` y fallback de gradiente · votación en grupo por miembro ·
vista de impresión dedicada (`PrintView`) · reordenar actividades dentro del
día (↑/↓ en Itinerary) · nombre de viaje fijo · atajo de noches en el Header.

✅ Hecho 2026-05-27 (2ª tanda):
- Votos a nivel **individual por participante** (default "Persona 1/2",
  renombrables). El modelo sigue siendo `votes` por miembro.
- **Distancias reales** para todos los destinos: las 6 principales de la tabla
  del PDF; el resto calculadas con **OSRM** (router.project-osrm.org). Se
  eliminó el flag `est`.
- **8 puntos nuevos** (`data/places.js` + `activities.js` + distancias en
  ambas bases): Ascain, Saint-Pée (lago), Cambo-les-Bains (Villa Arnaga),
  Hendaya, Guéthary, Cuevas de Isturitz, Hondarribia (ES), Itxassou (Pas de
  Roland). Imágenes Wikimedia 500px salvo Isturitz (gradiente, sin foto buena).
- **Perfiles rápidos** (`data/profiles.js`, 5 planes): `applyProfile` en
  useTripState fija base + vota todo el plan por todos los participantes +
  carga el itinerario. UI: `ProfilesBar` (con confirmación) al inicio del
  Itinerario. Un perfil ("Interior") sugiere la base Chez Lucas.
- **Mapa con itinerario por carretera** (`RegionMap.jsx`): por cada día con
  actividades dibuja una ruta base → paradas (orden del itinerario) → base,
  con color por día y badge "Dn" en los marcadores. La geometría sigue las
  carreteras reales vía **OSRM en runtime** (`router.project-osrm.org`,
  cacheada por firma de waypoints); si un tramo falla, línea recta discontinua
  de respaldo. Leyenda de días bajo el mapa.

✅ Hecho 2026-05-28:
- **Página de Inicio** (`IntroPanel.jsx`): tab `inicio` (default), con hero,
  contexto del país, datos de un vistazo, lugares por zona (con foto y desc),
  «no te lo pierdas», antes-de-salir y CTAs a las otras vistas.
- **Drag-and-drop nativo HTML5** en el Itinerario: arrastrar actividades entre
  días, reordenar dentro de un día (drop sobre item = insertar antes), y
  soltar en «Marcadas sin asignar» = desasignar. Sin librerías. Helpers:
  `insertActivity(day, actId, index)` en `useTripState`. Acompañado de un
  selector «+ Añadir» por día y un mini-select «Día N ▾» por item para mover
  rápido en móvil (donde el DnD nativo no va).
- **Nombres reales por defecto** de los 8 participantes (editables).

Requiere datos reales (no código):
1. **Precios reales** de Maison y Chez Lucas (`pricePerNight` es estimación).

Mejoras opcionales:
2. **Comentarios por actividad** (además del voto).
3. **Imágenes** para Isturitz y Hondarribia (hoy gradiente) y más fotos/comida.
4. **Orden del itinerario por horas** (ahora manual ↑/↓).
