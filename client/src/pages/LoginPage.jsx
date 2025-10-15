import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { authAPI } from "../services/api"
import { getProfile } from "../services/userService"
import UniversalModal from "../components/Popups/UniversalModal"
import "../styles/Login.css"

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" })
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState("")
  const [modalMessage, setModalMessage] = useState("")
  const [hideOkButton, setHideOkButton] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const autoCloseTimerRef = useRef(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await authAPI.post("/login", form)
      if (res.status === 200) {
        const token = res.data.token
        let userData = res.data.user || res.data.data?.user
        
        console.log('Login response:', { token: !!token, userData, fullResponse: res.data })
        
        // If userData not in login response, try fetching it
        if (!userData) {
          console.log('User data not in login response, fetching profile...')
          localStorage.setItem("token", token) // Temporarily set token
          try {
            userData = await getProfile()
            console.log('Profile fetched successfully:', userData)
          } catch (profileErr) {
            console.error('Failed to fetch profile:', profileErr)
            // If profile fetch fails, extract what we can from login response
            userData = { 
              email: form.email,
              // Backend might return other fields, log them for debugging
            }
          }
        }
        
        // Call login with both token and userData
        login(token, userData)
        setModalTitle("Login Successful!")
        setModalMessage("You have logged in successfully. Redirecting to homepage.")
        setHideOkButton(true)
        setShowModal(true)
      } else {
        setModalTitle("Login Failed")
        setModalMessage(res.data?.message || "Login failed")
        setHideOkButton(false)
        setShowModal(true)
      }
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err.response?.data?.message || err.message || "Something went wrong"
      setModalTitle("Login Failed")
      setModalMessage(errorMessage)
      setHideOkButton(false)
      setShowModal(true)
    }
  }

  const handleOk = () => {
    setShowModal(false)
    if (modalTitle === "Login Successful!") {
      navigate("/")
    }
  }

  useEffect(() => {
    if (!showModal) return undefined

    if (modalTitle === "Login Successful!" || modalTitle === "Login Failed") {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current)
      }
      autoCloseTimerRef.current = setTimeout(() => {
        setShowModal(false)
        autoCloseTimerRef.current = null
        if (modalTitle === "Login Successful!") {
          navigate("/")
        }
      }, 2000)
    }

    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current)
        autoCloseTimerRef.current = null
      }
    }
  }, [showModal, modalTitle, navigate])

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Movietok</h1>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
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
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p className="login-text">
          Don’t have an account?{" "}
          <Link to="/signup" className="login-link">
            Sign Up
          </Link>
        </p>
      </div>
      <UniversalModal
        isOpen={showModal}
        title={modalTitle}
        message={modalMessage}
        onOk={handleOk}
        hideOkButton={hideOkButton}
      />
    </div>
  )
}
