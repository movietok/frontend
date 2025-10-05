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

  // Optional: refresh user from backend on mount ONLY if user not in localStorage
  // This prevents unnecessary logout when navigating between pages
  useEffect(() => {
    const token = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")
    
    // Only fetch if we have token but no stored user data
    if (token && !storedUser && !user) {
      console.log('🔄 No user data found, fetching from backend...')
      getProfile()
        .then((freshUser) => {
          console.log('✅ User profile fetched:', freshUser)
          setUser(freshUser)
          localStorage.setItem("user", JSON.stringify(freshUser))
        })
        .catch((err) => {
          console.error("❌ Failed to fetch user profile:", err.response?.status, err.response?.data)
          // Only logout if it's an auth error (401/403), not other errors like 400
          if (err.response?.status === 401 || err.response?.status === 403) {
            console.log('🚪 Invalid token, logging out')
            logout()
          } else {
            console.log('⚠️ Profile fetch failed but keeping token (may be temporary backend issue)')
          }
        })
    } else if (token && storedUser) {
      console.log('✅ User already loaded from localStorage, skipping fetch')
    }
  }, [])

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
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
