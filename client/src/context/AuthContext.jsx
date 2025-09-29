import { createContext, useContext, useState, useEffect } from "react"
import { deleteAccount as deleteAccountService } from "../services/userService"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"))

  // Update when localStorage changes login/logout
  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem("token"))
    window.addEventListener("storage", checkAuth)
    return () => window.removeEventListener("storage", checkAuth)
  }, [])

  const login = (token) => {
    localStorage.setItem("token", token)
    setIsLoggedIn(true)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
  }

  // Delete account Service
  const deleteAccount = async () => {
    try {
      await deleteAccountService() // api call
      logout()
    } catch (err) {
      console.error(err)
      alert("Failed to delete account")
    }
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
