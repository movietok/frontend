import { useState } from "react"
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
  const [hideOkButton, setHideOkButton] = useState(false) // ✅ new state to control OK button visibility
  const [showRickroll, setShowRickroll] = useState(false) // 🎵 Rickroll popup state
  const navigate = useNavigate()
  const { login } = useAuth()

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
        setHideOkButton(true) // ✅ hide OK button during auto-close
        setShowModal(true)

        // ✅ Auto-close modal after 2 seconds and navigate
        setTimeout(() => {
          setShowModal(false)
          navigate("/")
        }, 2000)

      } else {
        setModalTitle("Login Failed")
        setModalMessage(res.data?.message || "Login failed")
        setHideOkButton(false) // ✅ show OK button for manual dismissal
        setShowModal(true)
        
        // 🎵 Rickroll popup on login fail
        setShowRickroll(true)
      }
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err.response?.data?.message || err.message || "Something went wrong"
      setModalTitle("Login Failed")
      setModalMessage(errorMessage)
      setHideOkButton(false) // ✅ show OK button for manual dismissal
      setShowModal(true)
      
      // 🎵 Rickroll popup on login fail
      setShowRickroll(true)
    }
  }

  const handleOk = () => {
    setShowModal(false)
    if (modalTitle === "Login Successful!") {
      navigate("/")
    }
  }

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
        hideOkButton={true} // ✅ pass prop to control button visibility
      />

      {/* 🎵 Rickroll Video Popup */}
      {showRickroll && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setShowRickroll(false)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '800px',
              aspectRatio: '16/9'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowRickroll(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: '#ff4d4d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                zIndex: 10000
              }}
            >
              ✕ Close
            </button>
            <iframe
              width="100%"
              height="100%"
              src="https://youtu.be/dQw4w9WgXcQ?si=_nrCC-U6K4o-u9Q_"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              style={{
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(255, 77, 77, 0.5)'
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
