import { useState, useEffect } from "react"
import { getProfile } from "../services/userService"

export function useProfile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getProfile()
      .then(setUser)
      .catch(err => setError(err))
      .finally(() => setLoading(false))
  }, [])

  return { user, loading, error }
}