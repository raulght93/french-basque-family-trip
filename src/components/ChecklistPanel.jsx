import { useState } from "react";
import { colors, fonts, radii, shadows } from "../styles/tokens.js";
import { useChecklist } from "../hooks/useChecklist.js";
import { CATEGORIES } from "../data/checklistItems.js";
import { daysUntil, deadlineLevel } from "../utils/dates.js";

const catLabel = (id) => CATEGORIES.find((c) => c.id === id) || { label: id, glyph: "•" };

const DEADLINE_PALETTE = {
  past:   { bg: colors.dangerSoft,  fg: colors.dangerText },
  soon:   { bg: colors.warningSoft, fg: colors.warningText },
  future: { bg: colors.successSoft, fg: colors.successText },
};
const deadlineText = (d) => {
  if (d < 0) return `vencido (${-d} d)`;
  if (d === 0) return "¡hoy!";
  return `en ${d} días`;
};

const DeadlineBadge = ({ iso }) => {
  const d = daysUntil(iso);
  const { bg, fg } = DEADLINE_PALETTE[deadlineLevel(iso)];
  return (
    <span style={{ background: bg, color: fg, borderRadius: radii.pill, padding: "1px 8px", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap" }}>
      ⏳ {deadlineText(d)}
    </span>
  );
};

export const ChecklistPanel = ({ state, size }) => {
  const cl = useChecklist({ cars: state.cars });
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState("");
  const [draftCat, setDraftCat] = useState("casa");

  const items = [...cl.autoItems, ...cl.customItems];
  const visible = filter === "all" ? items : items.filter((i) => i.category === filter);
  const pct = cl.total ? Math.round((cl.done / cl.total) * 100) : 0;

  // Deadline-bearing items, soonest first.
  const deadlines = cl.autoItems
    .filter((i) => i.deadline && !cl.checked[i.id])
    .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline));

  const addDraft = () => {
    const t = draft.trim();
    if (!t) return;
    cl.addCustom(t, draftCat);
    setDraft("");
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontFamily: fonts.serif, fontSize: size.isMobile ? "26px" : "32px", color: colors.text, marginBottom: "6px" }}>
        Checklist
      </h2>

      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <div style={{ flex: 1, height: "10px", background: colors.bgPanel, borderRadius: radii.pill, overflow: "hidden", border: `1px solid ${colors.border}` }}>
          <div style={{ width: `${pct}%`, height: "100%", background: colors.green, transition: "width 0.3s" }} />
        </div>
        <span style={{ fontSize: "13px", fontWeight: 700, color: colors.textBody, fontFamily: fonts.sans, whiteSpace: "nowrap" }}>
          {cl.done}/{cl.total}
        </span>
      </div>

      {/* Deadline alerts */}
      {deadlines.length > 0 && (
        <section style={{ background: colors.warningSoft, border: `1px solid ${colors.warning}`, borderRadius: radii.lg, padding: "14px 16px", marginBottom: "18px" }}>
          <div style={{ fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", color: colors.warningText, fontWeight: 700, marginBottom: "8px" }}>
            ⏳ Fechas límite pendientes
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "6px" }}>
            {deadlines.map((i) => (
              <li key={i.id} style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", fontSize: "13px", color: colors.text }}>
                <span>{i.label}</span>
                <DeadlineBadge iso={i.deadline} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Category filter */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
        {[{ id: "all", label: "Todo", glyph: "📋" }, ...CATEGORIES].map((c) => {
          const on = filter === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(c.id)}
              style={{
                background: on ? colors.accent : colors.bgCard,
                color: on ? colors.onAccent : colors.textBody,
                border: `1px solid ${on ? colors.accent : colors.border}`,
                borderRadius: radii.pill, padding: "6px 12px", fontSize: "12.5px", fontWeight: 600,
                cursor: "pointer", fontFamily: fonts.sans,
              }}
            >
              {c.glyph} {c.label}
            </button>
          );
        })}
      </div>

      {/* Items */}
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "6px" }}>
        {visible.map((i) => {
          const done = !!cl.checked[i.id];
          const isCustom = i.id.startsWith("custom_");
          return (
            <li
              key={i.id}
              style={{
                display: "flex", alignItems: "flex-start", gap: "10px",
                background: colors.bgCard, border: `1px solid ${colors.border}`,
                borderRadius: radii.md, padding: "11px 13px",
              }}
            >
              <input
                type="checkbox"
                checked={done}
                onChange={() => cl.toggleItem(i.id)}
                aria-label={i.label}
                style={{ width: "18px", height: "18px", marginTop: "1px", accentColor: colors.green, cursor: "pointer", flex: "0 0 auto" }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "13.5px", color: colors.text, textDecoration: done ? "line-through" : "none", opacity: done ? 0.55 : 1 }}>
                    {i.label}
                  </span>
                  {i.deadline && !done && <DeadlineBadge iso={i.deadline} />}
                </div>
                {i.note && <div style={{ fontSize: "12px", color: colors.textSubtle, marginTop: "2px", lineHeight: 1.4 }}>{i.note}</div>}
                <div style={{ fontSize: "10.5px", color: colors.textSubtle, marginTop: "3px" }}>{catLabel(i.category).glyph} {catLabel(i.category).label}</div>
              </div>
              {isCustom && (
                <button
                  type="button"
                  aria-label={`Eliminar ${i.label}`}
                  onClick={() => cl.removeCustom(i.id)}
                  style={{ background: "transparent", border: "none", color: colors.textSubtle, cursor: "pointer", fontSize: "15px" }}
                >
                  🗑️
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {/* Add custom */}
      <div data-print="hide" style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addDraft()}
          placeholder="Añadir un ítem propio…"
          aria-label="Nuevo ítem de checklist"
          style={{
            flex: "1 1 200px", background: colors.bgCard, color: colors.textBody,
            border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: "9px 12px",
            fontSize: "13px", fontFamily: fonts.sans,
          }}
        />
        <select
          value={draftCat}
          onChange={(e) => setDraftCat(e.target.value)}
          aria-label="Categoría del ítem"
          style={{ background: colors.bgCard, color: colors.textBody, border: `1px solid ${colors.border}`, borderRadius: radii.md, padding: "9px 10px", fontSize: "13px", fontFamily: fonts.sans, cursor: "pointer" }}
        >
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <button
          type="button"
          onClick={addDraft}
          style={{ background: colors.accent, color: colors.onAccent, border: "none", borderRadius: radii.md, padding: "9px 16px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: fonts.sans }}
        >
          + Añadir
        </button>
      </div>
    </div>
  );
};

export default ChecklistPanel;
