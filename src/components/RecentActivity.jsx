import { colors, fonts, radii } from "../styles/tokens.js";
import { relativeTime } from "../utils/dates.js";

// Recent activity ring buffer rendered as a compact feed. Source: cloud KV
// (the trip Worker maintains last ~50 events).
const KIND_GLYPH = {
  vote: "🎫",
  comment: "💬",
  base: "🏠",
  itinerary: "📅",
};

export const RecentActivity = ({ state, max = 10 }) => {
  const log = (state.recentLog || []).slice(0, max);
  if (log.length === 0) {
    return (
      <p style={{ fontFamily: fonts.sans, fontSize: "13px", color: colors.textSubtle, fontStyle: "italic", margin: 0 }}>
        Aún no hay movimiento compartido. En cuanto alguien vote o elija algo, aparecerá aquí.
      </p>
    );
  }
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "6px" }}>
      {log.map((entry) => (
        <li
          key={`${entry.ts}-${entry.memberId}-${entry.kind}`}
          style={{
            display: "flex", alignItems: "flex-start", gap: "9px",
            background: colors.bgPanel, border: `1px solid ${colors.border}`,
            borderRadius: radii.md, padding: "8px 10px",
            fontFamily: fonts.sans, fontSize: "12.5px",
          }}
        >
          <span aria-hidden="true" style={{ fontSize: "14px", lineHeight: 1.4 }}>
            {KIND_GLYPH[entry.kind] || "•"}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: colors.text, lineHeight: 1.4 }}>
              <strong>{state.memberName(entry.memberId)}</strong> {entry.summary}
            </div>
            <div style={{ fontSize: "10.5px", color: colors.textSubtle, marginTop: "2px" }}>
              {relativeTime(entry.ts)}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default RecentActivity;
