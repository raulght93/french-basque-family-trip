import { colors, fonts, radii, shadows } from "../styles/tokens.js";
import { PLACES, placeById, ZONE_GRADIENT, ZONE_LABEL } from "../data/places.js";
import { activityById, TYPE_META } from "../data/activities.js";
import { FOODS } from "../data/food.js";
import { PHRASES_EU, PHRASES_FR } from "../data/phrases.js";
import { LINK_GROUPS } from "../data/links.js";
import { Img } from "./Img.jsx";

// Welcome view: context of the region, villages, must-sees, practical info.
// Landing tab — gives everyone a quick mental map of the area before they
// start voting or planning days.

// Featured activities curated as "imperdibles".
const MUST_SEE_IDS = [
  "tren_larrun", "cuevas_sare", "sanjuan_costa", "biarritz_costa",
  "bayonne_ciudad", "espelette_pueblo", "ainhoa_pueblo", "itxassou_pasroland",
];

const FACTS = [
  { glyph: "🗣️", label: "Idiomas", value: "Francés y euskera. Un poco de francés ayuda; «kaixo» abre puertas." },
  { glyph: "💶", label: "Moneda", value: "Euro a los dos lados de la frontera." },
  { glyph: "☀️", label: "Clima en agosto", value: "Cálido (22-28 °C) con humedad atlántica. Posibles chubascos cortos." },
  { glyph: "🚗", label: "Conducir en Francia", value: "Chaleco reflectante y triángulo obligatorios. Peajes en autopista." },
  { glyph: "🥖", label: "Cocina", value: "Pintxos, jamón de Bayona, chocolate, queso de oveja Ossau-Iraty y axoa." },
  { glyph: "🌶️", label: "Símbolo", value: "El pimiento de Espelette (AOP) y el rojo vasco en las fachadas." },
];

const PracticalLi = ({ children }) => (
  <li style={{ fontSize: "13px", color: colors.textBody, lineHeight: 1.55, marginBottom: "6px" }}>
    {children}
  </li>
);

export const IntroPanel = ({ state, size, onJump }) => {
  const heroPlace = placeById("sare");
  const placesByZone = {
    montana: PLACES.filter((p) => p.zone === "montana"),
    costa: PLACES.filter((p) => p.zone === "costa"),
    navarra: PLACES.filter((p) => p.zone === "navarra"),
  };

  const card = {
    background: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.lg,
    boxShadow: shadows.sm,
    overflow: "hidden",
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Hero */}
      <section
        style={{
          position: "relative",
          borderRadius: radii.xl,
          overflow: "hidden",
          marginBottom: "24px",
          minHeight: size.isMobile ? "260px" : "360px",
          background: ZONE_GRADIENT.montana,
        }}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          <Img src={heroPlace?.img} alt="País Vasco francés" zone="montana" eager zoomable={false} />
        </div>
        <div
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "linear-gradient(180deg, rgba(15,30,25,0.15) 0%, rgba(15,30,25,0.75) 100%)",
          }}
        />
        <div style={{ position: "relative", padding: size.isMobile ? "30px 22px 26px" : "50px 40px 40px", color: "#FFF" }}>
          <div style={{ fontSize: "11px", letterSpacing: "2.5px", textTransform: "uppercase", opacity: 0.85, fontWeight: 600 }}>
            Iparralde · Pays Basque · 2026
          </div>
          <h1 style={{ fontFamily: fonts.serif, fontSize: size.isMobile ? "34px" : "52px", lineHeight: 1.05, margin: "8px 0 12px", fontWeight: 700 }}>
            Bienvenidos al País Vasco francés
          </h1>
          <p style={{ fontFamily: fonts.sans, fontSize: size.isMobile ? "14.5px" : "17px", lineHeight: 1.55, maxWidth: 640, opacity: 0.95 }}>
            Una semana entre los Pirineos atlánticos y la costa cantábrica:
            pueblos blancos con maderas rojas, mercados, olas, pintxos y un
            tren centenario que sube a la cima del Larrún. Esta guía os ayuda
            a decidir base, votar lo que más os apetezca y planificar el día
            a día.
          </p>
          {onJump && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "18px" }}>
              <button type="button" onClick={() => onJump("decidir")} style={ctaPrimary}>
                🏠 Decidir base
              </button>
              <button type="button" onClick={() => onJump("actividades")} style={ctaGhostOnHero}>
                🎫 Ver actividades
              </button>
              <button type="button" onClick={() => onJump("mapa")} style={ctaGhostOnHero}>
                🗺️ Abrir mapa
              </button>
            </div>
          )}
        </div>
      </section>

      {/* About the region */}
      <section style={{ ...card, padding: size.isMobile ? "18px" : "24px", marginBottom: "20px" }}>
        <h2 style={h2Style(size)}>El país, en cinco trazos</h2>
        <div style={{ display: "grid", gridTemplateColumns: size.isDesktop ? "1fr 1fr" : "1fr", gap: "14px 26px", fontFamily: fonts.sans, fontSize: "13.5px", color: colors.textBody, lineHeight: 1.6 }}>
          <p>
            El <strong>Pays Basque Nord</strong> (Iparralde) es el lado francés del País Vasco:
            tres provincias históricas — <em>Labourd</em> (la costa y los pueblos blancos), <em>Basse-Navarre</em> (Saint-Jean-Pied-de-Port) y <em>Soule</em> (más al este).
            Una mezcla rara y bonita de verde pirenaico, olas atlánticas, ferias de pueblo y
            casas de entramado con vigas rojas o verdes.
          </p>
          <p>
            Aquí se habla <strong>francés y euskera</strong>: vais a ver carteles en las dos
            lenguas y oír palabras como <em>kaixo</em> (hola), <em>eskerrik asko</em> (gracias) o
            el clásico <em>bonjour</em> en la panadería. La gente es amable, las cenas se hacen
            tarde, y el pelotari del frontón es paisaje habitual.
          </p>
          <p>
            La comida es de mesa larga: <strong>jamón de Bayona</strong>, chocolate (Bayonne fue
            la primera ciudad chocolatera de Francia), <strong>queso de oveja Ossau-Iraty</strong>,
            axoa de ternera, gâteau basque y, en agosto, todo con un buen Irouléguy o sidra
            del valle.
          </p>
          <p>
            En la costa: <strong>Biarritz</strong> y sus playas de surf, la bahía protegida de <strong>San Juan de Luz</strong>,
            los 3 km de arena de <strong>Hendaya</strong> y, al otro lado del estuario, <strong>Hondarribia</strong>.
            Hacia el interior: <strong>Sare</strong>, <strong>Ainhoa</strong> y <strong>Espelette</strong>,
            los pueblos «más bellos de Francia», y la subida en cremallera a <strong>La Rhune</strong>.
          </p>
        </div>
      </section>

      {/* Quick facts */}
      <section style={{ marginBottom: "22px" }}>
        <h2 style={h2Style(size)}>De un vistazo</h2>
        <div style={{ display: "grid", gridTemplateColumns: gridCols(size, "1fr", "1fr 1fr", "repeat(3, 1fr)"), gap: "10px" }}>
          {FACTS.map((f) => (
            <div key={f.label} style={{ ...card, padding: "12px 14px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", color: colors.accent, fontWeight: 700, marginBottom: "3px" }}>
                {f.glyph} {f.label}
              </div>
              <div style={{ fontSize: "13px", color: colors.textBody, lineHeight: 1.45 }}>{f.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Places, by zone */}
      <section style={{ marginBottom: "22px" }}>
        <h2 style={h2Style(size)}>Los lugares</h2>
        {[
          { id: "montana", title: "⛰️ Montaña · Labourd interior", desc: "Pueblos blancos, pelota, queso y senderos suaves." },
          { id: "costa",   title: "🏖️ Costa atlántica",            desc: "Playas, surf, paseos marítimos y ciudades vivas." },
          { id: "navarra", title: "🪄 Valle de Xareta (Navarra)",   desc: "Aldeas, cuevas y la senda de los Pottoks azules. Al otro lado de la frontera, de visita." },
        ].map((group) => (
          <div key={group.id} style={{ marginBottom: "14px" }}>
            <div style={{ marginBottom: "8px", fontFamily: fonts.sans }}>
              <span style={{ fontWeight: 700, color: colors.text }}>{group.title}</span>
              <span style={{ marginLeft: "8px", color: colors.textSubtle, fontSize: "12.5px" }}>{group.desc}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: gridCols(size, "1fr", "repeat(2, 1fr)", "repeat(3, 1fr)"), gap: "10px" }}>
              {placesByZone[group.id].map((p) => (
                <article key={p.id} style={card}>
                  <div style={{ height: "120px" }}>
                    <Img src={p.img} alt={p.name} zone={p.zone} caption={`${p.name} — ${p.desc}`} />
                  </div>
                  <div style={{ padding: "10px 12px 12px" }}>
                    <div style={{ fontFamily: fonts.serif, fontSize: "17px", color: colors.text, lineHeight: 1.15 }}>{p.name}</div>
                    <div style={{ fontSize: "11.5px", color: colors.textMuted, marginBottom: "5px" }}>{ZONE_LABEL[p.zone]} · {p.country === "ES" ? "España" : "Francia"}</div>
                    <p style={{ fontSize: "12.5px", color: colors.textBody, lineHeight: 1.45, margin: 0 }}>{p.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Must-sees */}
      <section style={{ marginBottom: "22px" }}>
        <h2 style={h2Style(size)}>Lo que no os podéis perder</h2>
        <div style={{ display: "grid", gridTemplateColumns: gridCols(size, "1fr", "repeat(2, 1fr)", "repeat(4, 1fr)"), gap: "10px" }}>
          {MUST_SEE_IDS.map((id) => {
            const a = activityById(id);
            if (!a) return null;
            const p = placeById(a.placeId);
            const tm = TYPE_META[a.type] || {};
            return (
              <article key={id} style={card}>
                <div style={{ height: "110px" }}>
                  <Img src={a.img || p?.img} alt={a.name} zone={p?.zone} caption={`${a.name} — ${a.desc}`} />
                </div>
                <div style={{ padding: "9px 11px 11px" }}>
                  <div style={{ fontFamily: fonts.sans, fontSize: "13px", fontWeight: 700, color: colors.text, lineHeight: 1.2 }}>
                    {tm.glyph} {a.name}
                  </div>
                  <div style={{ fontSize: "11px", color: colors.textMuted, marginTop: "2px" }}>
                    {p?.name}{a.price > 0 ? ` · ${a.price} €/pers` : " · gratis"}
                  </div>
                  {a.lowMobilityOk === false && (
                    <div style={{ marginTop: "4px", fontSize: "10.5px", fontWeight: 700, color: colors.dangerText, background: colors.dangerSoft, border: `1px solid ${colors.danger}`, borderRadius: radii.pill, padding: "1px 7px", display: "inline-block" }}>
                      ⚠️ Movilidad reducida
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Cocina vasca — open by default */}
      <details open style={{ ...card, padding: size.isMobile ? "16px" : "20px", marginBottom: "18px" }}>
        <summary style={summaryStyle(size)}>
          <span>🍽️ Cocina vasca</span>
          <span aria-hidden="true" className="chevron" style={chevronStyle}>▾</span>
        </summary>
        <p style={{ fontSize: "13px", color: colors.textMuted, margin: "8px 0 12px", lineHeight: 1.5 }}>
          Lo que no podéis dejar de probar. Pulsa una foto para ampliarla.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: gridCols(size, "1fr 1fr", "repeat(3, 1fr)", "repeat(4, 1fr)"), gap: "10px" }}>
          {FOODS.map((f) => (
            <article key={f.id} style={card}>
              <div style={{ height: "110px" }}>
                <Img src={f.img} alt={f.name} caption={`${f.name} — ${f.desc}`} />
              </div>
              <div style={{ padding: "9px 11px 11px" }}>
                <div style={{ fontFamily: fonts.serif, fontSize: "15.5px", color: colors.text, lineHeight: 1.15 }}>{f.name}</div>
                <p style={{ fontSize: "12px", color: colors.textBody, lineHeight: 1.45, marginTop: "3px" }}>{f.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </details>

      {/* Frases útiles — collapsed by default */}
      <details style={{ ...card, padding: size.isMobile ? "16px" : "20px", marginBottom: "18px" }}>
        <summary style={summaryStyle(size)}>
          <span>🗣️ Frases útiles</span>
          <span aria-hidden="true" className="chevron" style={chevronStyle}>▾</span>
        </summary>
        <div style={{ display: "grid", gridTemplateColumns: size.isDesktop ? "1fr 1fr" : "1fr", gap: "18px", marginTop: "12px" }}>
          <div>
            <h3 style={{ fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: colors.accent, fontWeight: 700, marginBottom: "8px" }}>
              🪶 Euskera (las que abren puertas)
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "5px", fontFamily: fonts.sans, fontSize: "13px", color: colors.textBody, lineHeight: 1.5 }}>
              {PHRASES_EU.map((p) => (
                <li key={p.eu}><strong style={{ color: colors.text }}>{p.eu}</strong> <span style={{ color: colors.textMuted }}>— {p.es}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: colors.accent, fontWeight: 700, marginBottom: "8px" }}>
              🇫🇷 Français (lo básico)
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "5px", fontFamily: fonts.sans, fontSize: "13px", color: colors.textBody, lineHeight: 1.5 }}>
              {PHRASES_FR.map((p) => (
                <li key={p.fr}><strong style={{ color: colors.text }}>{p.fr}</strong> <span style={{ color: colors.textMuted }}>— {p.es}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </details>

      {/* Enlaces útiles — collapsed by default */}
      <details style={{ ...card, padding: size.isMobile ? "16px" : "20px", marginBottom: "22px" }}>
        <summary style={summaryStyle(size)}>
          <span>🔗 Enlaces útiles</span>
          <span aria-hidden="true" className="chevron" style={chevronStyle}>▾</span>
        </summary>
        <div style={{ display: "grid", gridTemplateColumns: gridCols(size, "1fr", "1fr 1fr", "1fr 1fr 1fr"), gap: "16px", marginTop: "12px" }}>
          {LINK_GROUPS.map((g) => (
            <div key={g.id}>
              <h3 style={{ fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: colors.accent, fontWeight: 700, marginBottom: "8px" }}>
                {g.glyph} {g.title}
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "5px" }}>
                {g.items.map((i) => (
                  <li key={i.url}>
                    <a
                      href={i.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{ fontFamily: fonts.sans, fontSize: "13px", color: colors.accent, textDecoration: "none", borderBottom: `1px dotted ${colors.accentBorder}` }}
                    >
                      {i.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>

      {/* Practical / before you go */}
      <section style={{ ...card, padding: size.isMobile ? "16px" : "20px", marginBottom: "22px" }}>
        <h2 style={{ ...h2Style(size), marginTop: 0 }}>Antes de salir</h2>
        <ul style={{ listStyle: "disc", paddingLeft: "20px", margin: 0 }}>
          <PracticalLi><strong>Reservas con caducidad</strong> — Maison (Sare) cancela hasta el <strong>17 jul</strong>; Chez Lucas se paga ahora y cancela hasta el <strong>4 ago</strong>. Decidid la base antes para no perder ninguna.</PracticalLi>
          <PracticalLi><strong>Reservad el tren de La Rhune</strong> online, se agota en agosto (26 €/persona, salidas desde 8:20).</PracticalLi>
          <PracticalLi><strong>Movilidad reducida</strong> en las Cuevas de Sare: llamad <em>dos días antes por la mañana</em>; la galería inferior es accesible.</PracticalLi>
          <PracticalLi><strong>Coche</strong>: chaleco reflectante y triángulo (obligatorios en Francia), tarjeta de peajes/efectivo para la A63, mapas offline.</PracticalLi>
          <PracticalLi><strong>Pasaporte/DNI</strong> en regla; Tarjeta Sanitaria Europea para todos. Hondarribia se cruza desde Hendaya con la lancha del estuario.</PracticalLi>
          <PracticalLi><strong>Mercado de Sare</strong>: viernes 16:30–20:30 en agosto. Día perfecto para callejear sin coche.</PracticalLi>
        </ul>
      </section>

      {/* CTA footer */}
      {onJump && (
        <section style={{ ...card, padding: size.isMobile ? "16px" : "22px", textAlign: "center" }}>
          <h2 style={{ fontFamily: fonts.serif, fontSize: "22px", color: colors.text, marginBottom: "6px" }}>¿Listos?</h2>
          <p style={{ fontSize: "13.5px", color: colors.textMuted, marginBottom: "14px" }}>
            Empieza por elegir base. Cada participante puede votar sus actividades favoritas y la
            app cuadra el itinerario con tiempos de coche reales.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
            <button type="button" onClick={() => onJump("decidir")} style={ctaPrimary}>🏠 Decidir base</button>
            <button type="button" onClick={() => onJump("itinerario")} style={ctaGhost}>📅 Plan rápido</button>
          </div>
        </section>
      )}
    </div>
  );
};

const h2Style = (size) => ({
  fontFamily: fonts.serif,
  fontSize: size.isMobile ? "22px" : "26px",
  color: colors.text,
  margin: "8px 0 12px",
});

// Pick a grid column template per breakpoint (avoids nested ternaries inline).
const gridCols = (size, mobile, tablet, desktop) => {
  if (size.isMobile) return mobile;
  if (size.isDesktop) return desktop;
  return tablet;
};

// <summary> styled as a clickable h2 with a rotating chevron on the right.
// The chevron's rotation is handled by the global CSS rule in tokens.js
// (`details[open] > summary span[aria-hidden="true"].chevron`).
const summaryStyle = (size) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  listStyle: "none",
  fontFamily: fonts.serif,
  fontSize: size.isMobile ? "22px" : "26px",
  color: colors.text,
  fontWeight: 700,
  lineHeight: 1.1,
});

const chevronStyle = {
  display: "inline-block",
  fontSize: "18px",
  color: colors.accent,
  transition: "transform 0.18s",
};

const ctaPrimary = {
  background: colors.accent,
  color: colors.onAccent,
  border: "none",
  borderRadius: radii.pill,
  padding: "10px 18px",
  fontSize: "13.5px",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: fonts.sans,
};
// Ghost button used in cards (accent-coloured). Overridden inline inside the
// hero where the background is dark.
const ctaGhost = {
  background: "transparent",
  color: colors.accent,
  border: `1px solid ${colors.accentBorder}`,
  borderRadius: radii.pill,
  padding: "10px 16px",
  fontSize: "13.5px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: fonts.sans,
};
const ctaGhostOnHero = { ...ctaGhost, color: "#FFF", border: "1px solid rgba(255,255,255,0.7)" };

export default IntroPanel;
