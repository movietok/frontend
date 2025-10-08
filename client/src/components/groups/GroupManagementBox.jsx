// src/components/groups/GroupManagementBox.jsx
import { useState } from "react";
import EditGroupModal from "./EditGroupModal";
import { deleteGroup } from "../../services/groupService";
import OnsitePopup from "../Popups/OnsitePopup";

export default function GroupManagementBox({ group, onGroupUpdated, onGroupDeleted }) {
  const [showEditModal, setShowEditModal] = useState(false);

  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("info");
  const [popupConfirmAction, setPopupConfirmAction] = useState(null);
  const [popupCancelAction, setPopupCancelAction] = useState(null);
  const [popupConfirmText, setPopupConfirmText] = useState("OK");
  const [popupCancelText, setPopupCancelText] = useState("Cancel");

  // Helper: safely resolve ID no matter what the backend shape is
  const getGroupId = () => group?.id || group?.gID || group?.group?.id;

  const handleDelete = async () => {
    const groupId = getGroupId();
    if (!groupId) {
      setPopupMessage("Error: Group ID not found.");
      setPopupType("error");
      setPopupConfirmText("OK");
      setPopupCancelAction(null);
      setShowPopup(true);
      return;
    }

    // Ask for confirmation
    setPopupMessage("Are you sure you want to delete this group?");
    setPopupType("confirm");
    setPopupConfirmText("Yes, Delete");
    setPopupCancelText("Cancel");

    setPopupConfirmAction(() => async () => {
      try {
        await deleteGroup(groupId);
        setPopupMessage("Group deleted successfully!");
        setPopupType("success");
        setPopupConfirmText("OK");
        setPopupCancelAction(null);
        setPopupConfirmAction(() => () => setShowPopup(false));

        if (onGroupDeleted) onGroupDeleted(groupId);
      } catch (err) {
        console.error("Delete failed:", err);
        setPopupMessage("Failed to delete group.");
        setPopupType("error");
        setPopupConfirmText("OK");
        setPopupCancelAction(null);
      }
    });

    setPopupCancelAction(() => () => setShowPopup(false));
    setShowPopup(true);
  };

  return (
    <div className="p-4 border rounded bg-gray-50 shadow mt-6">
      <h3 className="text-lg font-semibold mb-3">Management</h3>
      <div className="space-x-2">
        <button
          onClick={() => {
            console.log("🟢 Edit Group clicked");
            setShowEditModal(true);
          }}
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
      </div>

      {showEditModal && (
        <EditGroupModal
          group={group}
          onClose={() => setShowEditModal(false)}
          onSave={onGroupUpdated}
        />
      )}

      {/* Unified Onsite Popup */}
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
    </div>
  );
}
