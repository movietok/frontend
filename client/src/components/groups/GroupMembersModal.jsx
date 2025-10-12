import { useEffect, useMemo, useState } from "react";
import { getGroupDetails } from "../../services/groups";
import { Link } from "react-router-dom";
import {
  getPendingRequests,
  removeMember,
  updateMemberRole,
  approveJoinRequest,
  declineJoinRequest,
} from "../../services/groupService";
import "../../styles/GroupMembersModal.css";

const roleLabels = {
  owner: "Owner",
  moderator: "Moderator",
  member: "Member",
  pending: "Pending",
};

function normalizeMembers(group) {
  const raw = group?.members;
  if (!Array.isArray(raw)) return [];
  return raw.filter((m) => m.role && m.role !== "pending");
}

export default function GroupMembersModal({
  group,
  currentUserId,
  visible,
  onClose,
  viewerRole,
  onGroupUpdated,
  pushToast,
}) {
  const groupId = useMemo(
    () => group?.id ?? group?.gID ?? group?.group?.id ?? null,
    [group]
  );

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [pending, setPending] = useState([]);
  const [activeTab, setActiveTab] = useState("members");
  const [busyId, setBusyId] = useState(null);

  const visibility = group?.visibility ?? "public";
  const normalizedViewerRole = (viewerRole || "").toLowerCase();
  const isOwner = normalizedViewerRole === "owner";
  const isModerator = normalizedViewerRole === "moderator";
  const canManageMembers = isOwner || isModerator;
  const canManageRequests = canManageMembers && visibility !== "public";
  const showRequestsTab = canManageRequests;

  useEffect(() => {
    if (!visible || !groupId) return;

    setLoading(true);
    (async () => {
      try {
        await refreshData();
      } catch (error) {
        console.error("Failed to load members:", error);
        pushToast?.(
          error?.response?.data?.error ||
            error?.message ||
            "Failed to load members.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [visible, groupId, showRequestsTab]);

  async function refreshData() {
    if (!groupId) return;
    const data = await getGroupDetails(groupId);
    const g = data?.group ?? data;
    setMembers(normalizeMembers(g));
    // Preserve membership info for main page
onGroupUpdated?.({
  ...group,
  ...g,
  role: g.role ?? group.role,
  is_member: g.is_member ?? group.is_member,
  is_owner: g.is_owner ?? group.is_owner,
});

    if (showRequestsTab) {
      try {
        const reqs = await getPendingRequests(groupId);
        setPending(reqs);
      } catch (error) {
        console.error("Failed to load pending requests:", error);
        pushToast?.(
          error?.response?.data?.error ||
            error?.message ||
            "Failed to load pending requests.",
          "error"
        );
        setPending([]);
      }
    } else {
      setPending([]);
    }
  }

  useEffect(() => {
    if (!showRequestsTab && activeTab === "requests") {
      setActiveTab("members");
    }
  }, [showRequestsTab, activeTab]);

  const closeModal = () => {
    setActiveTab("members");
    setMembers([]);
    setPending([]);
    onClose?.();
  };

  const handleRemove = async (userId) => {
    if (!groupId || !userId) return;
    if (userId === currentUserId) {
      pushToast?.("Use the leave button to remove yourself.", "info");
      return;
    }
    setBusyId(`remove-${userId}`);
    try {
      await removeMember(groupId, userId);
      pushToast?.("Member removed from group.", "success");
      await refreshData();
    } catch (error) {
      console.error("Failed to remove member:", error);
      pushToast?.(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to remove member.",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  };

const handlePromote = async (userId) => {
  if (!groupId || !userId) return;
  setBusyId(`role-${userId}`);
  try {
    await updateMemberRole(groupId, userId, "moderator");
    pushToast?.("Member promoted to moderator.", "success");
    await refreshData();
  } catch (error) {
    console.error("Failed to promote member:", error);
    pushToast?.(
      error?.response?.data?.error ||
        error?.message ||
        "Failed to promote member.",
      "error"
    );
  } finally {
    setBusyId(null);
  }
};

const handleDemote = async (userId) => {
  if (!groupId || !userId) return;
  setBusyId(`role-${userId}`);
  try {
    await updateMemberRole(groupId, userId, "member");
    pushToast?.("Moderator demoted to member.", "success");
    await refreshData();
  } catch (error) {
    console.error("Failed to demote member:", error);
    pushToast?.(
      error?.response?.data?.error ||
        error?.message ||
        "Failed to demote member.",
      "error"
    );
  } finally {
    setBusyId(null);
  }
};


  const handleApprove = async (userId) => {
    if (!groupId || !userId) return;
    setBusyId(`approve-${userId}`);
    try {
      await approveJoinRequest(groupId, userId);
      pushToast?.("Request approved.", "success");
      await refreshData();
    } catch (error) {
      console.error("Failed to approve request:", error);
      pushToast?.(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to approve request.",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDecline = async (userId) => {
    if (!groupId || !userId) return;
    setBusyId(`decline-${userId}`);
    try {
      await declineJoinRequest(groupId, userId);
      pushToast?.("Request declined.", "info");
      await refreshData();
    } catch (error) {
      console.error("Failed to decline request:", error);
      pushToast?.(
        error?.response?.data?.error ||
          error?.message ||
          "Failed to decline request.",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  };

  if (!visible || !groupId) return null;

  return (
    <div className="group-members-modal__backdrop" onClick={closeModal}>
      <div
        className="group-members-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-members-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="group-members-modal__header">
          <h2 id="group-members-title">Group Members</h2>
          {/* Fixed close button */}
          <button className="close-btn" onClick={closeModal} aria-label="Close">
            ×
          </button>
        </header>

        <div className="group-members-modal__tabs">
          <button
            className={activeTab === "members" ? "active" : ""}
            onClick={() => setActiveTab("members")}
          >
            Members ({members.length})
          </button>
          {showRequestsTab && (
            <button
              className={activeTab === "requests" ? "active" : ""}
              onClick={() => setActiveTab("requests")}
            >
              Requests ({pending.length})
            </button>
          )}
        </div>

        <section className="group-members-modal__content">
          {loading ? (
            <p className="group-members-modal__empty">Loading...</p>
          ) : activeTab === "members" ? (
            members.length === 0 ? (
              <p className="group-members-modal__empty">No members yet.</p>
            ) : (
              <ul className="group-members-modal__list">
                {members.map((member) => {
  const { id, username, role, joined_at } = member;
  const label = roleLabels[role] || role;
  const joined = joined_at
    ? new Date(joined_at).toLocaleDateString()
    : "";
  const isSelf =
    currentUserId && Number(currentUserId) === Number(id);

  const canRemove =
    (isOwner || (isModerator && role === "member")) &&
    !isSelf &&
    role !== "owner";

  const canDemote = isOwner && role === "moderator";
  const canPromoteMember = isOwner && role === "member";

  return (
    <div key={id} className="member-row">
      {/* ⬇️ Replace the plain username with a clickable Link */}
      <Link
        to={`/profile/${id}`}
        className="member-link"
        onClick={onClose} // optional: close modal when clicked
      >
        {username}
      </Link>

      <span className="member-role"> – {label}</span>
      <span className="member-joined">Joined: {joined}</span>

      {/* existing management buttons below */}
      {canPromoteMember && (
  <button
    className="promote-btn"
    disabled={busyId === `role-${id}`}
    onClick={() => handlePromote(id)}
  >
    Promote
  </button>
)}
{canDemote && (
  <button
    className="demote-btn"
    disabled={busyId === `role-${id}`}
    onClick={() => handleDemote(id)}
  >
    Demote
  </button>
)}

      {canRemove && (
        <button className="remove-btn" onClick={() => handleRemove(id)}>
          Remove
        </button>
      )}
    </div>
  );
})}
              </ul>
            )
          ) : showRequestsTab ? (
            pending.length === 0 ? (
              <p className="group-members-modal__empty">No pending requests.</p>
            ) : (
              <ul className="group-members-modal__list">
                {pending.map((req) => {
                  const userId = req.user_id ?? req.userId ?? req.id;
                  const username =
                    req.username ?? req.user_name ?? req.name ?? "Unknown";
                  const requestedAt = req.requested_at || req.joined_at;
                  const requested = requestedAt
                    ? new Date(requestedAt).toLocaleString()
                    : null;

                  return (
                    <li key={userId} className="group-members-modal__row">
                      <div>
                        <div className="group-members-modal__name">
                          {username}
                        </div>
                        <div className="group-members-modal__meta">
                          <span className="role role-pending">Pending</span>
                          {requested && <span>Requested {requested}</span>}
                        </div>
                      </div>
                      <div className="group-members-modal__actions">
                        <button
                          onClick={() => handleApprove(userId)}
                          disabled={busyId === `approve-${userId}`}
                          className="btn-primary"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDecline(userId)}
                          disabled={busyId === `decline-${userId}`}
                          className="btn-danger"
                        >
                          Decline
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )
          ) : (
            <p className="group-members-modal__empty">
              This group does not require approvals.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
