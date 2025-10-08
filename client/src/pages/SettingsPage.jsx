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
    bio: user?.user_bio || "",
    newPassword: ""
  })

  const [currentPassword, setCurrentPassword] = useState("")
  const [pendingPayload, setPendingPayload] = useState(null)

  const [message, setMessage] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showDeletedModal, setShowDeletedModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const payload = {}
    if (formData.username && formData.username !== user.username) {
      payload.username = formData.username
    }
    if (formData.email && formData.email.trim() !== "" && formData.email !== user.email) {
      payload.email = formData.email
    }
    if (formData.newPassword) {
      payload.newPassword = formData.newPassword
    }

    if (Object.keys(payload).length === 0) {
      setMessage("❌ No changes to update.")
      return
    }

    setPendingPayload(payload)
    setShowPasswordModal(true)
  }

  const handleBioUpdate = () => {
    if (formData.bio === user.user_bio) {
      setMessage("❌ Bio is unchanged.")
      return
    }

    setPendingPayload({ user_bio: formData.bio })
    setShowPasswordModal(true)
  }

  const confirmUpdate = async () => {
    if (!currentPassword) {
      setMessage("❌ Current password is required.")
      return
    }

    const payload = {
      ...pendingPayload,
      currentPassword
    }

    try {
      const updated = await updateProfile(payload)
      setUser(updated)
      localStorage.setItem("user", JSON.stringify(updated))

      setSuccessMessage(
        pendingPayload?.user_bio
          ? "✅ Bio updated successfully!"
          : "✅ Profile changes saved!"
      )
      setShowSuccessModal(true)
      setMessage(null)
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || "Update failed."}`)
    } finally {
      setShowPasswordModal(false)
      setCurrentPassword("")
      setPendingPayload(null)
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
    <div className="settings-page-wrapper">
      <div className="settings-container">
        <h2>Profile Settings</h2>

        <div className="settings-bio-section">
          <label>Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            placeholder="Tell us about yourself..."
          />
          <button type="button" className="bio-btn" onClick={handleBioUpdate}>
            Set Bio
          </button>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          <label>New Email</label>
          <input name="email" value={formData.email} onChange={handleChange} />

          <label>New Username</label>
          <input name="username" value={formData.username} onChange={handleChange} />

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
      </div>

      {/* 🔐 Password confirmation modal */}
      <UniversalModal
        isOpen={showPasswordModal}
        title="To apply changes"
        message="Please enter your current password to confirm."
        inputLabel="Current Password"
        inputType="password"
        inputValue={currentPassword}
        onInputChange={(e) => setCurrentPassword(e.target.value)}
        onOk={confirmUpdate}
        onCancel={() => {
          setShowPasswordModal(false)
          setPendingPayload(null)
          setCurrentPassword("")
        }}
      />

      {/* ✅ Success feedback modal */}
      <UniversalModal
        isOpen={showSuccessModal}
        title="Success"
        message={successMessage}
        onOk={() => setShowSuccessModal(false)}
      />

      {/* ❌ Account deletion confirmation */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Delete Account?"
        message="Are you sure you want to delete your account? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* ✅ Account deleted modal */}
      <UniversalModal
        isOpen={showDeletedModal}
        title="Account Deleted"
        message="Your account has been deleted successfully."
        onOk={() => window.location.href = "/signup"}
      />
    </div>
  )
}
