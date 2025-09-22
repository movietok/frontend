import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { authAPI } from "../services/api"
import "../styles/Signup.css"

export default function SignUp() {
  const [form, setForm] = useState({ username: "", email: "", password: "" })
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await authAPI.post("/register", form)

      if (res.status === 200 || res.status === 201) {
        //alert("Account created successfully!")
        navigate("/login")
      } else {
        alert(res.data?.message || "Registration failed")
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Something went wrong"
      alert(errorMessage)
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
    </div>
  )
}
