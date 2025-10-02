import { useState, useEffect } from "react"
import {
  addFavorite,
  removeFavorite,
  getUserFavorites,
} from "../services/favoriteService"


export function useFavorites(userId, type, groupId = null) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId || !type) return
    console.log("🔍 Fetching favorites for user:", userId, "type:", type)

    getUserFavorites(userId, type)
      .then((data) => {
        console.log("✅ Favorites response:", data)
        setFavorites(data || [])
      })
      .catch((err) => {
        console.error("❌ Error loading favorites:", err)
        setError(err)
      })
      .finally(() => setLoading(false))
  }, [userId, type])

  const add = async (movie_id) => {
    try {
      await addFavorite(movie_id, type, groupId)
      setFavorites((prev) => [...prev, { movie_id }])
    } catch (err) {
      console.error("❌ Error adding favorite:", err)
    }
  }

  const remove = async (movie_id) => {
    try {
      await removeFavorite(movie_id, type, groupId)
      setFavorites((prev) => prev.filter((f) => f.movie_id !== movie_id))
    } catch (err) {
      console.error("❌ Error removing favorite:", err)
    }
  }

  return { favorites, loading, error, add, remove }
}
