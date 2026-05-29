import { useState } from "react";
import { useResponsive } from "../hooks/useResponsive.js";
import { colors, fonts, radii } from "../styles/tokens.js";
import { IdentityModal } from "./IdentityModal.jsx";

const ONLINE_WINDOW_MS = 5 * 60 * 1000;

// Compact identity strip:
//   "👤 Tú eres: Raúl · ✎ Cambiar"  +  family roster (with online dots).
// On mobile, the roster collapses to "🟢 N en línea · Ver familia" to keep
// the bar one line. Tapping expands the full list. The change-identity
// shortcut is also in the Header — this lives inside panels for context.
export const MemberBar = ({ state, compact = false }) => {
  const size = useResponsive();
  const [modalOpen, setModalOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const { members, selfMemberId, memberName, presence = {} } = state;

  const selfName = selfMemberId ? memberName(selfMemberId) : "—";
  const now = Date.now();
  const isOnline = (id) => {
    const last = presence[id];
    if (!last) return false;
    return now - new Date(last).getTime() < ONLINE_WINDOW_MS;
  };
  const onlineCount = members.filter((m) => isOnline(m.id)).length;
  const showRoster = !size.isMobile || rosterOpen;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "8px 12px",
        ...(compact
          ? {}
          : {
              background: colors.bgPanel,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.lg,
              padding: "10px 14px",
            }),
      }}
    >
      <span style={{ fontSize: "13px", color: colors.textBody, fontFamily: fonts.sans, whiteSpace: "nowrap" }}>
        <span aria-hidden="true" style={{ marginRight: "4px" }}>👤</span>
        Tú:{" "}
        <strong style={{ color: colors.text }}>{selfName}</strong>
      </span>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        style={{
          background: "transparent",
          color: colors.accent,
          border: `1px dashed ${colors.accentBorder}`,
          borderRadius: radii.pill,
          padding: "3px 10px",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: fonts.sans,
        }}
      >
        ✎ {selfMemberId ? "Cambiar" : "Elegir"}
      </button>

      {size.isMobile && !rosterOpen ? (
        <button
          type="button"
          onClick={() => setRosterOpen(true)}
          style={{
            background: "transparent",
            color: colors.textMuted,
            border: "none",
            fontSize: "11.5px",
            fontFamily: fonts.sans,
            cursor: "pointer",
            padding: "2px 4px",
            marginLeft: "auto",
          }}
          aria-expanded="false"
        >
          🟢 {onlineCount}/{members.length} · ver familia
        </button>
      ) : null}

      {showRoster && (
        <span
          style={{
            flex: 1, minWidth: size.isMobile ? "100%" : "180px",
            fontSize: "11.5px", color: colors.textSubtle, fontFamily: fonts.sans, lineHeight: 1.6,
          }}
        >
          {size.isMobile && rosterOpen && (
            <button
              type="button"
              onClick={() => setRosterOpen(false)}
              aria-label="Ocultar la familia"
              style={{ background: "transparent", border: "none", color: colors.textSubtle, fontSize: "11px", cursor: "pointer", padding: 0, marginRight: "6px" }}
            >
              ▴
            </button>
          )}
          Familia:{" "}
          {members.map((m, i) => {
            const online = isOnline(m.id);
            return (
              <span
                key={m.id}
                title={online ? "Online ahora" : "Sin conexión reciente"}
                style={{ whiteSpace: "nowrap", marginRight: "2px" }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    width: "7px", height: "7px", borderRadius: "50%",
                    background: online ? colors.success : "transparent",
                    border: online ? "none" : `1px solid ${colors.borderStrong}`,
                    marginRight: "4px", verticalAlign: "middle",
                  }}
                />
                <span style={{ color: online ? colors.text : colors.textSubtle, fontWeight: online ? 600 : 400 }}>
                  {m.name}
                </span>
                {i < members.length - 1 && <span style={{ color: colors.textSubtle }}> · </span>}
              </span>
            );
          })}
        </span>
      )}

      <IdentityModal
        open={modalOpen}
        currentId={selfMemberId}
        onCancel={() => setModalOpen(false)}
        onPick={(id) => { state.setSelfMemberId(id); setModalOpen(false); }}
      />
    </div>
  );
};

export default MemberBar;
