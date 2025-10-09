import { createContext, useContext, useState, useEffect } from "react"
import { deleteAccount as deleteAccountService, getProfile } from "../services/userService.js"

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"))
const [user, setUser] = useState(() => {
  try {
    const stored = localStorage.getItem("user")
    return stored && stored !== "undefined" ? JSON.parse(stored) : null
  } catch {
    return null
  }
})

  // Sync with localStorage on external tab changes
  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")
      setIsLoggedIn(!!token)
      setUser(storedUser ? JSON.parse(storedUser) : null)
    }
    window.addEventListener("storage", syncAuth)
    return () => window.removeEventListener("storage", syncAuth)
  }, [])

  // Removed automatic profile refresh to prevent unexpected logouts
  // User data is loaded from localStorage on mount (see useState above)
  // Profile will be fetched during login process only

  const login = (token, userData) => {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(userData))
    setIsLoggedIn(true)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setIsLoggedIn(false)
    setUser(null)
  }

  const deleteAccount = async () => {
    try {
      await deleteAccountService()
      logout()
    } catch (err) {
      console.error("❌ Failed to delete account:", err)
      alert("Failed to delete account")
    }
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, setUser, login, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
