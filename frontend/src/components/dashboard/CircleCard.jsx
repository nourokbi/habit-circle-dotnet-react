import { Copy, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toastError, toastSuccess } from "../../utils/toast";

// ── Circle card ────────────────────────────────────────
export default function CircleCard({ circle, currentUserId, onRequestDelete }) {
  const navigate = useNavigate();

  const isAdmin = circle.members?.some(
    (m) => m.userId === currentUserId && m.role === "admin",
  );
  const memberCount = circle.members?.length ?? 0;
  const habitCount = circle.circleHabits?.length ?? 0;

  const handleCopyInvite = async (e) => {
    e.stopPropagation();

    const code = circle.inviteCode;
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      toastSuccess("Invite code copied to clipboard.", "Invite copied");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
        toastSuccess("Invite code copied to clipboard.", "Invite copied");
      } catch {
        toastError("Could not copy invite code.");
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onRequestDelete?.(circle);
  };

  return (
    <div
      className={`circle-card circle-card-clickable ${isAdmin ? "circle-admin" : "circle-member"}`}
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/circles/${circle.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") navigate(`/circles/${circle.id}`);
      }}
    >
      <div className="circle-card-header">
        <span className="circle-name">{circle.name}</span>

        <div className="circle-card-actions">
          {isAdmin && circle.inviteCode && (
            <button
              type="button"
              className="circle-copy-btn"
              onClick={handleCopyInvite}
              onKeyDown={(e) => e.stopPropagation()}
              title="Copy invite code"
              aria-label="Copy invite code"
            >
              <Copy size={14} />
              <span>Invite</span>
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              className="circle-delete-btn"
              onClick={handleDelete}
              onKeyDown={(e) => e.stopPropagation()}
              title="Delete circle"
              aria-label="Delete circle"
            >
              <Trash2 size={14} />
            </button>
          )}

          <span
            className={`role-badge ${isAdmin ? "badge-admin" : "badge-member"}`}
          >
            {isAdmin ? "admin" : "member"}
          </span>
        </div>
      </div>

      <div className="circle-stats">
        <span>{memberCount} members</span>
        <span>·</span>
        <span>{habitCount} habits shared</span>
      </div>

      {circle.description && (
        <p className="circle-desc">{circle.description}</p>
      )}
    </div>
  );
}
