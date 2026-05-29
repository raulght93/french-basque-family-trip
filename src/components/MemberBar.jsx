import { useState } from "react";
import { colors, fonts, radii } from "../styles/tokens.js";
import { IdentityModal } from "./IdentityModal.jsx";

// Compact identity strip: "👤 Tú eres: Raúl · cambiar" + a roster line
// listing the full team. Self-edit triggers the IdentityModal.
export const MemberBar = ({ state, compact = false }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const { members, selfMemberId, memberName } = state;

  const selfName = selfMemberId ? memberName(selfMemberId) : "—";

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
      <span style={{ flex: 1, minWidth: "180px", fontSize: "11.5px", color: colors.textSubtle, fontFamily: fonts.sans }}>
        Familia: {members.map((m) => m.name).join(" · ")}
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
