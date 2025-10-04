import { useState } from "react";
import { addFavorite, removeFavorite } from "../../services/favoriteService";
import { useAuth } from "../../context/AuthContext";
import "../../styles/GroupFavoritesButton.css";

export default function GroupFavoritesButton({
  tmdbId,
  groupId,
  initialIsFavorite = false,
  movieData = {},
  onStatusChange = null
}) {
  const { isLoggedIn } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  const toggleGroupFavorite = async () => {
    if (!tmdbId || !groupId) return;

    const payload = {
      movie_id: tmdbId,
      type: 2,
      group_id: groupId,
      original_title: movieData.original_title || movieData.title || "Unknown",
      release_year: movieData.release_year || movieData.release_date?.split("-")[0] || null,
      poster_path: movieData.poster_path || null
    };

    try {
      if (isFavorite) {
        await removeFavorite(tmdbId, 2, groupId);
        setIsFavorite(false);
        onStatusChange?.(tmdbId, false);
      } else {
        await addFavorite(tmdbId, 2, groupId, payload);
        setIsFavorite(true);
        onStatusChange?.(tmdbId, true);
      }
    } catch (err) {
      console.error("Error toggling group favorite:", err);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <button
      onClick={toggleGroupFavorite}
      className={`group-favorite-button ${isFavorite ? "active" : ""}`}
      aria-label="Toggle group favorite"
    >
      {isFavorite ? "💎" : "◇"}
    </button>
  );
}
