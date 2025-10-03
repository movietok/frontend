import { useState, useEffect } from "react"
import { addFavorite, removeFavorite } from "../../services/favoriteService"
import { useAuth } from "../../context/AuthContext"

const WatchlistButton = ({ 
  movieId, 
  initialIsWatchlist = false, 
  onStatusChange = null 
}) => {
  const [isWatchlist, setIsWatchlist] = useState(initialIsWatchlist)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // Update state when initialIsWatchlist prop changes
  useEffect(() => {
    setIsWatchlist(initialIsWatchlist)
  }, [initialIsWatchlist])

  const handleToggle = async (e) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (!user) {
      alert("Please login to add to watchlist")
      return
    }

    setLoading(true)
    try {
      if (isWatchlist) {
        // Remove from watchlist (type=1)
        await removeFavorite(movieId, 1, null)
        setIsWatchlist(false)
        onStatusChange?.(movieId, false) // Pass new watchlist status
      } else {
        // Add to watchlist (type=1)
        await addFavorite(movieId, 1, null)
        setIsWatchlist(true)
        onStatusChange?.(movieId, true) // Pass new watchlist status
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error)
      alert("Failed to update watchlist")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`watchlist-btn ${isWatchlist ? 'active' : ''}`}
      title={isWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
      style={{
        position: "absolute",
        top: "8px",
        right: "48px", // Position next to favorite button
        background: isWatchlist ? "rgba(255, 193, 7, 0.9)" : "rgba(0, 0, 0, 0.6)",
        border: "none",
        borderRadius: "50%",
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: loading ? "wait" : "pointer",
        fontSize: "14px",
        color: "white",
        transition: "all 0.2s ease",
        zIndex: 10
      }}
    >
      {loading ? "⏳" : isWatchlist ? "📋" : "📋"}
    </button>
  )
}

export default WatchlistButton