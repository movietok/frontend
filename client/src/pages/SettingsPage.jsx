import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { updateProfile } from "../services/userService"
import ConfirmModal from "../components/Popups/ConfirmModal"
import UniversalModal from "../components/Popups/UniversalModal"
import "../styles/SettingsPage.css"

export default function SettingsPage() {
  const { user, setUser, deleteAccount } = useAuth()
    const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: ""
    })

  const [message, setMessage] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showDeletedModal, setShowDeletedModal] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

    const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {};
    if (formData.username && formData.username !== user.username) {
    payload.username = formData.username;
    }
    if (formData.email && formData.email.trim() !== "" && formData.email !== user.email) {
    payload.email = formData.email;
    }
    if (formData.currentPassword && formData.newPassword) {
    payload.currentPassword = formData.currentPassword;
    payload.newPassword = formData.newPassword;
    }

    if (Object.keys(payload).length === 0) {
        setMessage("❌ No changes to update.");
        return;
    }

    try {
        const updated = await updateProfile(payload);
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        setMessage("✅ Profile updated successfully.");
    } catch (err) {
        setMessage(`❌ ${err.response?.data?.message || "Update failed."}`);
    }
    }

    const confirmDelete = async () => {
        try {
        await deleteAccount()
        setShowConfirmModal(false)
        setShowDeletedModal(true)
        } catch (err) {
        console.error("❌ Failed to delete account:", err)
        setShowConfirmModal(false)
        }
    }

  return (
    <div className="settings-container">
      <h2>Profile Settings</h2>
      <form onSubmit={handleSubmit} className="settings-form">
        <label>Email</label>
        <input name="email" value={formData.email} onChange={handleChange} />

        <label>Username</label>
        <input name="username" value={formData.username} onChange={handleChange} />

        <label>Current Password</label>
        <input name="currentPassword" type="password" onChange={handleChange} />

        <label>New Password</label>
        <input name="newPassword" type="password" onChange={handleChange} />

        <button type="submit">Save Changes</button>
        {message && <p className="settings-message">{message}</p>}
      </form>

      <div className="settings-actions">
        <button onClick={() => setShowConfirmModal(true)} className="delete-btn">
          Delete Account
        </button>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Delete Account?"
        message="Are you sure you want to delete your account? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirmModal(false)}
      />

      <UniversalModal
        isOpen={showDeletedModal}
        title="Account Deleted"
        message="Your account has been deleted successfully."
        onOk={() => window.location.href = "/signup"}
      />
    </div>
  )
}