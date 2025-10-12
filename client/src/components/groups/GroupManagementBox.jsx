import { useEffect, useMemo, useState } from "react";
import EditGroupModal from "./EditGroupModal";
import OnsitePopup from "../Popups/OnsitePopup";
import AutoDismissToast from "../Popups/AutoDismissToast";
import GroupMembersModal from "./GroupMembersModal";
import {
  joinGroup,
  requestToJoinGroup,
  leaveGroup,
  deleteGroup,
  getUserGroupsAPI,
  withdrawJoinRequest,
} from "../../services/groupService";

// Lightweight membership cache (per group/user)
const membershipCache = {
  key(groupId, userId) {
    return `mt.membership:${String(groupId)}:${String(userId)}`;
  },
  set(groupId, userId, value) {
    try {
      localStorage.setItem(this.key(groupId, userId), JSON.stringify({ value, ts: Date.now() }));
    } catch {}
  },
  get(groupId, userId, maxAgeMs = 24 * 60 * 60 * 1000) {
    try {
      const raw = localStorage.getItem(this.key(groupId, userId));
      if (!raw) return null;
      const { value, ts } = JSON.parse(raw);
      if (!ts || Date.now() - ts > maxAgeMs) {
        localStorage.removeItem(this.key(groupId, userId));
        return null;
      }
      return value; // "pending" | "member" | null
    } catch {
      return null;
    }
  },
  clear(groupId, userId) {
    try {
      localStorage.removeItem(this.key(groupId, userId));
    } catch {}
  },
};

function decodeUserIdFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const [, payload] = token.split(".");
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    return decoded?.id ?? null;
  } catch {
    return null;
  }
}

export default function GroupManagementBox({ group, onGroupUpdated, onGroupDeleted }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Confirm popup (leave/delete)
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("info");
  const [popupConfirmAction, setPopupConfirmAction] = useState(null);
  const [popupCancelAction, setPopupCancelAction] = useState(null);
  const [popupConfirmText, setPopupConfirmText] = useState("OK");
  const [popupCancelText, setPopupCancelText] = useState("Cancel");

  // Toast
  const [toast, setToast] = useState(null);
  const pushToast = (message, type = "info", duration = 2400) =>
    setToast({ id: Date.now(), message, type, duration });

  const [loadingAction, setLoadingAction] = useState(false);
  const [roleOverride, setRoleOverride] = useState(null); // drives buttons immediately

  const isLoggedIn = !!localStorage.getItem("token");
  const currentUserId = useMemo(decodeUserIdFromToken, []);
  const visibility = group?.visibility || "public";
  const getGroupId = () => group?.id ?? group?.gID ?? group?.group?.id;
  const gid = getGroupId();

  // Basic owner/member booleans
  const normalizedIsOwner =
    Boolean(group?.is_owner) ||
    (currentUserId != null && Number(currentUserId) === Number(group?.owner_id));

  const roleFromGroup = (group?.role || "").toLowerCase();
  const hasMembersList = Array.isArray(group?.members) && group.members.length >= 0; // empty array is still authoritative
  const viewerMember = hasMembersList
    ? group.members.find((m) => Number(m.id) === Number(currentUserId))
    : null;
  const roleFromMembers = (viewerMember?.role || "").toLowerCase();

  // ---- Effective role computation (authoritative members list when present) ----
  let effectiveRole = null;

  if (normalizedIsOwner) {
    effectiveRole = "owner";
  } else if (roleFromGroup) {
    // backend explicitly gave our role (member/mod/owner/pending)
    effectiveRole = roleFromGroup;
  } else if (hasMembersList) {
    // members list present: trust it
    if (roleFromMembers) {
      effectiveRole = roleFromMembers;           // "member" | "moderator"
    } else {
      // not in list => hard non-member, clear local state
      effectiveRole = null;
      if (gid && currentUserId) membershipCache.clear(gid, currentUserId);
      if (roleOverride) setRoleOverride(null);
    }
  } else if (roleOverride) {
    effectiveRole = roleOverride;                // UI override while backend sparse
  } else if (group?.is_member) {
    effectiveRole = "member";                    // legacy boolean
  } else {
    // backend is sparse (no role, no members list): we MAY reconcile using user's groups API
    effectiveRole = null;
  }

  const isOwner = effectiveRole === "owner";
  const isModerator = effectiveRole === "moderator";
  const isMember = isOwner || isModerator || effectiveRole === "member";
  const isPending = effectiveRole === "pending";

  useEffect(() => {
    if (showMembersModal && !(isMember || isOwner || isModerator)) {
      setShowMembersModal(false);
    }
  }, [showMembersModal, isMember, isOwner, isModerator]);

  // Reconcile when backend is sparse ONLY (no role and no members list)
  useEffect(() => {
    let cancelled = false;

    async function reconcile() {
      if (!gid || !currentUserId) return;

      // If members list exists, treat it as authoritative; don't second-guess with user groups.
      if (hasMembersList) return;

      // If backend provided explicit role (and we're not owner), sync cache and stop.
      if (roleFromGroup && !normalizedIsOwner) {
        if (!cancelled) {
          setRoleOverride(null);
          const r = roleFromGroup;
          if (r === "pending") membershipCache.set(gid, currentUserId, "pending");
          else if (["member", "moderator", "owner"].includes(r)) {
            membershipCache.set(gid, currentUserId, "member");
          } else {
            membershipCache.clear(gid, currentUserId);
          }
        }
        return;
      }

      // Sparse backend: consult user's groups as a fallback
      try {
        const list = await getUserGroupsAPI(currentUserId);
        const inGroup =
          Array.isArray(list) &&
          list.some((g) => Number(g.id ?? g.gID ?? g.group_id) === Number(gid));

        if (!cancelled && inGroup) {
          setRoleOverride("member");
          membershipCache.set(gid, currentUserId, "member");
        } else if (!cancelled) {
          setRoleOverride(null);
          membershipCache.clear(gid, currentUserId);
        }
      } catch {
        if (!cancelled) {
          // On error, prefer conservative non-member if nothing else says otherwise
          setRoleOverride(null);
          membershipCache.clear(gid, currentUserId);
        }
      }
    }

    reconcile();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gid, currentUserId, hasMembersList, roleFromGroup, normalizedIsOwner]);

  // Confirm helpers
  const openConfirm = (message, confirmText, onConfirm) => {
    setPopupMessage(message);
    setPopupType("confirm");
    setPopupConfirmText(confirmText);
    setPopupCancelText("Cancel");
    setPopupConfirmAction(() => onConfirm);
    setPopupCancelAction(() => () => setShowPopup(false));
    setShowPopup(true);
  };

  // Actions
  const handleJoinOrRequest = async () => {
    if (!isLoggedIn) { pushToast("You must be logged in to join groups.", "info"); return; }
    if (!gid)        { pushToast("Cannot determine group ID.", "error"); return; }

    // If we previously withdrew, make sure no stale cache blocks new request
    if (currentUserId) membershipCache.clear(gid, currentUserId);

    // If pending, don't re-hit backend
    const p = membershipCache.get(gid, currentUserId);
    if (p === "pending") {
      setRoleOverride("pending");
      pushToast("Join request is already pending.", "info");
      return;
    }

    setLoadingAction(true);
    try {
      if (visibility === "public") {
        await joinGroup(gid);
        const nextMembers = Array.isArray(group?.members)
          ? group.members.concat([{ id: currentUserId, role: "member", username: "(you)" }])
          : undefined;
        onGroupUpdated?.({ ...group, role: "member", is_member: true, members: nextMembers });
        setRoleOverride("member");
        membershipCache.set(gid, currentUserId, "member");
        pushToast("You have joined the group.", "success");
      } else {
        await requestToJoinGroup(gid);
        onGroupUpdated?.({ ...group, role: "pending" });
        setRoleOverride("pending");
        membershipCache.set(gid, currentUserId, "pending");
        pushToast("Join request sent. Please wait for approval.", "success");
      }
    } catch (err) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to join or request to join group.";

      if (
        status &&
        (status === 400 || status === 409) &&
        typeof message === "string" &&
        message.toLowerCase().includes("pending")
      ) {
        onGroupUpdated?.({ ...group, role: "pending" });
        setRoleOverride("pending");
        if (currentUserId) membershipCache.set(gid, currentUserId, "pending");
        pushToast("Join request is already pending.", "info");
      } else if (typeof message === "string" && message.toLowerCase().includes("already a member")) {
        const nextMembers = Array.isArray(group?.members)
          ? group.members.concat([{ id: currentUserId, role: "member", username: "(you)" }])
          : undefined;
        onGroupUpdated?.({ ...group, role: "member", is_member: true, members: nextMembers });
        setRoleOverride("member");
        if (currentUserId) membershipCache.set(gid, currentUserId, "member");
        pushToast("You are already a member of this group.", "info");
      } else if (typeof message === "string" && message.toLowerCase().includes("already the owner")) {
        onGroupUpdated?.({ ...group, role: "owner", is_owner: true });
        setRoleOverride("owner");
        if (currentUserId) membershipCache.set(gid, currentUserId, "member");
        pushToast("You already own this group.", "info");
      } else {
        pushToast(message, "error");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const handleWithdrawRequest = () => {
    if (!gid) {
      pushToast("Cannot determine group ID.", "error");
      return;
    }

    openConfirm("Withdraw your join request?", "Withdraw", async () => {
      setLoadingAction(true);
      try {
        await withdrawJoinRequest(gid);
        onGroupUpdated?.({ ...group, role: null });
        setRoleOverride(null);
        if (currentUserId) membershipCache.clear(gid, currentUserId);
        setShowPopup(false);
        pushToast("Join request withdrawn.", "success");
      } catch (err) {
        const code = err?.response?.status;
        if (code === 404 || code === 410) {
          onGroupUpdated?.({ ...group, role: null });
          setRoleOverride(null);
          if (currentUserId) membershipCache.clear(gid, currentUserId);
          setShowPopup(false);
          pushToast("Join request withdrawn.", "success");
          return;
        }
        const msg = err?.response?.data?.error || err?.message || "Failed to withdraw request.";
        setShowPopup(false);
        pushToast(msg, "error");
      } finally {
        setLoadingAction(false);
      }
    });
  };

  const handleLeave = () => {
    if (!gid) {
      pushToast("Cannot determine group ID.", "error");
      return;
    }
    openConfirm("Are you sure you want to leave this group?", "Leave Group", async () => {
      setLoadingAction(true);
      try {
        await leaveGroup(gid);

        // Remove self from the authoritative members list in parent state
        const filteredMembers = Array.isArray(group?.members)
          ? group.members.filter((m) => Number(m.id) !== Number(currentUserId))
          : group?.members;

        onGroupUpdated?.({
          ...group,
          role: null,
          is_member: false,
          members: filteredMembers,
        });

        setRoleOverride(null);
        membershipCache.clear(gid, currentUserId);
        setShowPopup(false);
        pushToast("You have left the group.", "success");
      } catch (err) {
        const msg = err?.response?.data?.error || err?.message || "Failed to leave group.";
        setShowPopup(false);
        pushToast(msg, "error");
      } finally {
        setLoadingAction(false);
      }
    });
  };

  const handleDelete = () => {
    if (!gid) {
      pushToast("Cannot determine group ID.", "error");
      return;
    }
    openConfirm("Are you sure you want to delete this group?", "Yes, Delete", async () => {
      try {
        await deleteGroup(gid);
        setShowPopup(false);
        pushToast("Group deleted successfully.", "success");
        onGroupDeleted?.(gid);
      } catch (err) {
        const msg = err?.response?.data?.error || err?.message || "Failed to delete group.";
        setShowPopup(false);
        pushToast(msg, "error");
      }
    });
  };

  const handleViewMembers = () => {
    if (!isMember && !isModerator && !isOwner) {
      pushToast("You need to be in the group to view members.", "info");
      return;
    }
    setShowMembersModal(true);
  };

  if (!isLoggedIn) return null;

  return (
    <div className="p-4 border rounded bg-gray-50 shadow mt-6">
      <h3 className="text-lg font-semibold mb-3">Management</h3>

      <div className="flex flex-wrap gap-2">
        {/* Visitor (not in group) */}
        {!isMember && !isPending && (
          <button
            onClick={handleJoinOrRequest}
            disabled={loadingAction}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {visibility === "public" ? "Join Group" : "Request to Join"}
          </button>
        )}

        {/* Pending */}
        {isPending && (
          <button
            onClick={handleWithdrawRequest}
            disabled={loadingAction}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Withdraw Request
          </button>
        )}

        {/* Member & Moderator can leave */}
        {(effectiveRole === "member" || effectiveRole === "moderator") && (
          <button
            onClick={handleLeave}
            disabled={loadingAction}
            className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Leave Group
          </button>
        )}

        {/* All members (member/mod/owner) can view members */}
        {(isMember || isOwner) && (
          <button
            onClick={handleViewMembers}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            View Members
          </button>
        )}

        {/* Owner: Edit + Delete (no Leave) */}
        {isOwner && (
          <>
            <button
              onClick={() => setShowEditModal(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit Group
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete Group
            </button>
          </>
        )}
      </div>

      {showEditModal && (
        <EditGroupModal
          group={group}
          onClose={() => setShowEditModal(false)}
          onSave={onGroupUpdated}
        />
      )}

      {showPopup && (
        <OnsitePopup
          message={popupMessage}
          type={popupType}
          onConfirm={popupConfirmAction}
          onCancel={popupCancelAction}
          confirmText={popupConfirmText}
          cancelText={popupCancelText}
        />
      )}

      {showMembersModal && (
        <GroupMembersModal
          group={group}
          currentUserId={currentUserId}
          visible={showMembersModal}
          onClose={() => setShowMembersModal(false)}
          viewerRole={effectiveRole}
          onGroupUpdated={onGroupUpdated}
          pushToast={pushToast}
        />
      )}

      {toast && (
        <AutoDismissToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
