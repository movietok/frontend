import { useState, useEffect } from "react"
import { getUserReviews } from "../services/userService"

export function useUserReviews(userId) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return
    getUserReviews(userId)
      .then(setReviews)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [userId])

  return { reviews, loading, error }
}