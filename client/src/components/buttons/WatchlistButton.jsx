import { useState, useEffect } from "react";
import { addFavorite, removeFavorite } from "../../services/favoriteService";
import { useAuth } from "../../context/AuthContext";
import "../../styles/WatchlistButton.css";

const WatchlistButton = ({ tmdbId, initialIsWatchlist = false, onStatusChange = null }) => {
  const [isWatchlist, setIsWatchlist] = useState(initialIsWatchlist);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsWatchlist(initialIsWatchlist);
  }, [initialIsWatchlist]);

  const handleToggle = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) return;

    setLoading(true);
    try {
      if (isWatchlist) {
        await removeFavorite(tmdbId, 1, null);
        setIsWatchlist(false);
        onStatusChange?.(tmdbId, false);
      } else {
        await addFavorite(tmdbId, 1, null, { movie_id: tmdbId });
        setIsWatchlist(true);
        onStatusChange?.(tmdbId, true);
      }
    } catch (err) {
      console.error("Error toggling watchlist:", err);
      alert("Failed to update watchlist");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Only render if user is logged in
  if (!user) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="watchlist-button"
      aria-label={isWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
    >
      <span className={`watchlist-icon ${isWatchlist ? "active" : ""}`}>
        {loading ? "👁" : "👁"}
      </span>
    </button>
  );
};

export default WatchlistButton;
