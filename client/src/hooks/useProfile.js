import { useState, useEffect } from "react"
import { getProfile, getProfileById } from "../services/userService"

export function useProfile(userId = null) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Reset state
    setLoading(true)
    setError(null)
    
    // If userId provided (and not empty), fetch specific user profile
    // Otherwise, fetch current logged-in user's profile
    const fetchProfile = (userId && userId !== 'undefined') 
      ? getProfileById(userId) 
      : getProfile()
    
    fetchProfile
      .then(data => {
        setUser(data)
      })
      .catch(err => {
        console.error('Profile fetch error:', err)
        setError(err)
      })
      .finally(() => setLoading(false))
  }, [userId])

  return { user, loading, error }
}