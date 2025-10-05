import { useState, useEffect } from "react"
import { addFavorite, removeFavorite, getUserFavorites } from "../services/favoriteService"

export function useFavorites(userId, type, groupId = null) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId || !type) {
      setLoading(false)
      setFavorites([])
      return
    }

    setLoading(true)
    getUserFavorites(userId, type)
      .then((data) => setFavorites(data || []))
      .catch((err) => setError(err))
      .finally(() => setLoading(false))
  }, [userId, type])

  const add = async (tmdb_id) => {
    try {
      await addFavorite(tmdb_id, type, groupId)
      setFavorites((prev) => [...prev, { tmdb_id }])
    } catch (err) {
      console.error("Error adding favorite:", err)
    }
  }

  const remove = async (tmdb_id) => {
    try {
      await removeFavorite(tmdb_id, type, groupId)
      setFavorites((prev) => prev.filter((f) => f.tmdb_id !== tmdb_id))
    } catch (err) {
      console.error("Error removing favorite:", err)
    }
  }

  return { favorites, loading, error, add, remove }
}
