import { useState } from "react";
import { colors, fonts, radii } from "../styles/tokens.js";
import { IdentityModal } from "./IdentityModal.jsx";

// Members are considered online if their presence timestamp is within this
// window. Long enough to ride out a tab switch, short enough to feel "live".
const ONLINE_WINDOW_MS = 5 * 60 * 1000;

// Compact identity strip: "👤 Tú eres: Raúl · cambiar" + a roster line
// with a green dot for everyone currently online (from cloud presence).
export const MemberBar = ({ state, compact = false }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { members, selfMemberId, memberName, presence = {} } = state;

  const selfName = selfMemberId ? memberName(selfMemberId) : "—";
  const now = Date.now();
  const isOnline = (id) => {
    const last = presence[id];
    if (!last) return false;
    return now - new Date(last).getTime() < ONLINE_WINDOW_MS;
  };

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
      <span style={{ fontSize: "13px", color: colors.textBody, fontFamily: fonts.sans }}>
        <span aria-hidden="true" style={{ marginRight: "4px" }}>👤</span>
        Tú eres:{" "}
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
      <span style={{ flex: 1, minWidth: "180px", fontSize: "11.5px", color: colors.textSubtle, fontFamily: fonts.sans, lineHeight: 1.6 }}>
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
