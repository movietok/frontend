import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { authAPI } from "../services/api"
import "../styles/Login.css"

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" })
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
        login(res.data.token)
        localStorage.setItem("token", res.data.token) // save JWT
        alert("Login successful!")
        navigate("/")
      } else {
        alert(res.data?.message || "Login failed")
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Something went wrong"
      alert(errorMessage)
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
    </div>
  )
}

