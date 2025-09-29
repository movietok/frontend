import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { authAPI } from "../services/api"
import UniversalModal from "../components/Popups/UniversalModal"
import "../styles/Signup.css"

export default function SignUp() {
  const [form, setForm] = useState({ username: "", email: "", password: "" })
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("")
  const [modalMessage, setModalMessage] = useState("")
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await authAPI.post("/register", form)
      if (res.status === 200 || res.status === 201) {
        setModalTitle("Account Created!")
        setModalMessage("Your account was created successfully. Continue to login?")
        setShowModal(true)

      } else {
        setModalTitle("Registration Failed")
        setModalMessage(res.data?.message || "Registration failed")
        setShowModal(true)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Something went wrong"
      if (err.response?.status === 409 || errorMessage.toLowerCase().includes("exists")) {
        setModalTitle("User Already Exists")
        setModalMessage("An account with this email or username already exists.")
      } else {
        setModalTitle("Registration Failed")
        setModalMessage(errorMessage)
      }
      setShowModal(true)
    }
  }

  const handleOk = () => {
    setShowModal(false)
    if (modalTitle === "Account Created!") {
      navigate("/login")
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h1>Movietok</h1>
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Sign Up</button>
        </form>
        <p className="signup-text">
          Already have an account?{" "}
          <Link to="/login" className="signup-link">
            Login
          </Link>
        </p>
      </div>
      <UniversalModal
        isOpen={showModal}
        title={modalTitle}
        message={modalMessage}
        onOk={handleOk}
      />
    </div>
  )
}