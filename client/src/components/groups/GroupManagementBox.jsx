// src/components/groups/GroupManagementBox.jsx
import { useState } from "react";
import EditGroupModal from "./EditGroupModal";
import { deleteGroup } from "../../services/groupService";

export default function GroupManagementBox({ group, onGroupUpdated, onGroupDeleted }) {
  const [showEditModal, setShowEditModal] = useState(false);

  // Helper: safely resolve ID no matter what the backend shape is
  const getGroupId = () => group?.id || group?.gID || group?.group?.id;

  const handleDelete = async () => {
    const groupId = getGroupId();
    if (!groupId) {
      alert("Error: Group ID not found.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this group?")) return;

    try {
      await deleteGroup(groupId);
      alert("Group deleted successfully");
      if (onGroupDeleted) onGroupDeleted(groupId);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete group");
    }
  };

  return (
    <div className="p-4 border rounded bg-gray-50 shadow mt-6">
      <h3 className="text-lg font-semibold mb-3">Management</h3>
      <div className="space-x-2">
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
      </div>

      {showEditModal && (
        <EditGroupModal
          group={group}
          onClose={() => setShowEditModal(false)}
          onSave={onGroupUpdated}
        />
      )}
    </div>
  );
}
