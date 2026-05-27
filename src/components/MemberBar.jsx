import { colors, fonts, radii, shadows } from "../styles/tokens.js";

// Group voting bar: who is deciding, and who you're voting as right now.
// The active member is the one whose vote a "votar" click toggles.
export const MemberBar = ({ state, compact = false }) => {
  const { members, activeMemberId } = state;

  const onRename = (m) => {
    const name = globalThis.prompt?.("Nuevo nombre:", m.name);
    if (name && name.trim()) state.renameMember(m.id, name.trim().slice(0, 24));
  };
  const onAdd = () => {
    const name = globalThis.prompt?.("Nombre del participante:");
    if (name && name.trim()) state.addMember(name.trim().slice(0, 24));
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "8px",
        ...(compact ? {} : {
          background: colors.bgPanel,
          border: `1px solid ${colors.border}`,
          borderRadius: radii.lg,
          padding: "12px 14px",
        }),
      }}
    >
      <span style={{ fontSize: "12px", fontWeight: 700, color: colors.textMuted, fontFamily: fonts.sans }}>
        👤 Participante:
      </span>
      {members.map((m) => {
        const active = m.id === activeMemberId;
        return (
          <span
            key={m.id}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: active ? colors.accent : colors.bgCard,
              color: active ? colors.onAccent : colors.textBody,
              border: `1px solid ${active ? colors.accent : colors.border}`,
              borderRadius: radii.pill,
              padding: "4px 6px 4px 11px",
              fontSize: "12.5px",
              fontFamily: fonts.sans,
            }}
          >
            <button
              type="button"
              onClick={() => state.setActiveMemberId(m.id)}
              aria-pressed={active}
              aria-label={`Votar como ${m.name}`}
              style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", fontWeight: active ? 700 : 500, fontSize: "12.5px", fontFamily: fonts.sans, padding: 0 }}
            >
              {active ? "✓ " : ""}{m.name}
            </button>
            <button
              type="button"
              onClick={() => onRename(m)}
              aria-label={`Renombrar ${m.name}`}
              style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", opacity: 0.65, fontSize: "11px", padding: "0 2px" }}
            >
              ✎
            </button>
            {members.length > 1 && (
              <button
                type="button"
                onClick={() => state.removeMember(m.id)}
                aria-label={`Quitar ${m.name}`}
                style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", opacity: 0.65, fontSize: "13px", padding: "0 2px" }}
              >
                ×
              </button>
            )}
          </span>
        );
      })}
      <button
        type="button"
        onClick={onAdd}
        style={{
          background: "transparent",
          color: colors.accent,
          border: `1px dashed ${colors.accentBorder}`,
          borderRadius: radii.pill,
          padding: "4px 12px",
          fontSize: "12.5px",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: fonts.sans,
        }}
      >
        + Añadir
      </button>
    </div>
  );
};

export default MemberBar;
