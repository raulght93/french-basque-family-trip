import { useEffect, useState } from "react";
import { colors, fonts, radii } from "../styles/tokens.js";
import { relativeTime } from "../utils/dates.js";

// Per-activity comments block. Others' comments are read-only; your own is
// an editable single-line input that posts on blur / Enter (debounced sync
// is handled by useTripSync). Empty submit deletes your comment.
export const ActivityComments = ({ state, activityId }) => {
  const others = state.commentsForActivity(activityId)
    .filter((c) => c.memberId !== state.selfMemberId);
  const mine = state.getMyComment(activityId);
  const [draft, setDraft] = useState(mine?.text ?? "");
  const [editing, setEditing] = useState(false);

  // Sync the local draft when the cloud pushes a new value for our member
  // (e.g., we typed on another device).
  useEffect(() => {
    if (editing) return;
    setDraft(mine?.text ?? "");
  }, [mine?.text, editing]);

  const commit = () => {
    setEditing(false);
    if ((draft || "").trim() === (mine?.text || "").trim()) return;
    state.setMyComment(activityId, draft);
  };
  const cancel = () => {
    setEditing(false);
    setDraft(mine?.text ?? "");
  };

  if (others.length === 0 && !mine && !state.selfMemberId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", paddingTop: "2px" }}>
      {others.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          {others.map((c) => (
            <div
              key={c.memberId}
              style={{
                fontSize: "12px", color: colors.textBody, fontFamily: fonts.sans, lineHeight: 1.45,
              }}
            >
              <span style={{ color: colors.accent, fontWeight: 700, marginRight: "4px" }}>
                💬 {state.memberName(c.memberId)}:
              </span>
              <em style={{ color: colors.textBody }}>{c.text}</em>
              {c.ts && (
                <span style={{ color: colors.textSubtle, fontSize: "10.5px", marginLeft: "5px" }}>
                  · {relativeTime(c.ts)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* My comment editor */}
      {state.selfMemberId && (
        editing ? (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, 300))}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); commit(); }
                else if (e.key === "Escape") { e.preventDefault(); cancel(); }
              }}
              placeholder="Escribe un comentario…"
              aria-label="Mi comentario en esta actividad"
              style={{
                flex: 1, background: colors.bgCard, color: colors.text,
                border: `1px solid ${colors.borderStrong}`, borderRadius: radii.md,
                padding: "5px 9px", fontSize: "12.5px", fontFamily: fonts.sans,
              }}
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={commit}
              style={{ background: colors.accent, color: colors.onAccent, border: "none", borderRadius: radii.md, padding: "5px 10px", fontSize: "11.5px", fontWeight: 700, cursor: "pointer", fontFamily: fonts.sans }}
            >
              Guardar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            style={{
              alignSelf: "flex-start",
              background: "transparent",
              color: mine ? colors.text : colors.accent,
              border: `1px dashed ${colors.accentBorder}`,
              borderRadius: radii.md,
              padding: "4px 10px",
              fontSize: "12px",
              fontWeight: mine ? 600 : 500,
              fontFamily: fonts.sans,
              cursor: "pointer",
              textAlign: "left",
              maxWidth: "100%",
              fontStyle: mine ? "italic" : "normal",
            }}
          >
            {mine ? `💬 ${mine.text}  ✎` : "+ Añadir mi comentario"}
          </button>
        )
      )}
    </div>
  );
};

export default ActivityComments;
