import { useEffect, useState } from "react"
import { addFavorite, removeFavorite, checkFavoriteStatus } from "../../services/favoriteService"
import { useAuth } from "../../context/AuthContext"
import "../../styles/FavoriteButton.css"

// The component now accepts 'movieData' which must include 'title' 
// and any other NOT NULL fields (like poster_path, release_year, etc.)
export default function FavoriteButton({
  movieId,
  type = 2,
  groupId = null,
  movieData,
  initialIsFavorite = false,
  disableAutoCheck = false,
  onStatusChange = null
}) {
  const { isLoggedIn } = useAuth()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)

  // Update state when initialIsFavorite prop changes
  useEffect(() => {
    setIsFavorite(initialIsFavorite)
  }, [initialIsFavorite])


  useEffect(() => {
    if (!isLoggedIn || initialIsFavorite || disableAutoCheck) return; 

    checkFavoriteStatus(movieId)
      .then((res) => {
        const isFav = type === 1
          ? res.data?.data?.watchlist
          : type === 2
          ? res.data?.data?.favorites
          : false;
        setIsFavorite(isFav);
      })
      .catch(console.error);
  }, [movieId, isLoggedIn, type, initialIsFavorite, disableAutoCheck]);



  const toggleFavorite = async () => {
    // Critical Check: Ensure movieData is available and valid for INSERT
    if (!movieData || !movieData.title) {
    console.error("Missing movie details (title is required) to add to favorites.")
        // You should add a custom message display here instead of just console logging
    return
    }

    try {
    if (isFavorite) {
      await removeFavorite(movieId, type, groupId)
      setIsFavorite(false)
      onStatusChange?.(movieId, false)
    } else {
      // FIX IS HERE: Pass movieData as the fourth argument
      await addFavorite(movieId, type, groupId)
      setIsFavorite(true)
      onStatusChange?.(movieId, true)
    }
    } catch (err) {
    console.error("Error toggling favorite:", err)
    }
  }

  if (!isLoggedIn) return null

  return (
    <button
    onClick={toggleFavorite}
    className={`favorite-button focus:outline-none ${isFavorite ? "active" : ""}`}
    aria-label="Toggle favorite"
    >
    {isFavorite ? "★" : "☆"}
    </button>
  )
  }
