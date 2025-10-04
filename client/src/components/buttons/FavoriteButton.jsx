;import { useEffect, useState } from "react"
import { addFavorite, removeFavorite, checkFavoriteStatus } from "../../services/favoriteService"
import { useAuth } from "../../context/AuthContext"
import "../../styles/FavoriteButton.css"
import { searchMovies } from "../../services/api"

export default function FavoriteButton({
  tmdbId,
  type = 2,
  groupId = null,
  movieData,
  initialIsFavorite = false,
  disableAutoCheck = false,
  onStatusChange = null
}) {
  const { isLoggedIn } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  useEffect(() => {
    if (!isLoggedIn || initialIsFavorite || disableAutoCheck) return;

    checkFavoriteStatus(tmdbId)
      .then((res) => {
        const isFav = type === 1
          ? res.data?.data?.watchlist
          : type === 2
          ? res.data?.data?.favorites
          : false;
        setIsFavorite(isFav);
      })
      .catch(console.error);
  }, [tmdbId, isLoggedIn, type, initialIsFavorite, disableAutoCheck]);

  const toggleFavorite = async () => {
    console.log("toggleFavorite called with tmdbId:", tmdbId);
    if (!tmdbId) return;

    let enrichedData = movieData;

    if (!movieData || !movieData.original_title) {
      try {
        enrichedData = await searchMovies(tmdbId);
        console.log("Fetched enrichedData:", enrichedData);
      } catch (err) {
        console.error("Failed to fetch TMDB metadata:", err);
        return;
      }
    }

    const payload = {
      movie_id: tmdbId, 
      type,
      group_id: groupId,
      original_title: enrichedData.original_title || enrichedData.title || "Unknown",
      release_year: enrichedData.release_year || enrichedData.release_date?.split("-")[0] || null,
      poster_path: enrichedData.poster_path || null
    };

    try {
      if (isFavorite) {
        await removeFavorite(tmdbId, type, groupId);
        setIsFavorite(false);
        onStatusChange?.(tmdbId, false);
      } else {
        await addFavorite(tmdbId, type, groupId, payload);
        setIsFavorite(true);
        onStatusChange?.(tmdbId, true);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <button
      onClick={toggleFavorite}
      className={`favorite-button focus:outline-none ${isFavorite ? "active" : ""}`}
      aria-label="Toggle favorite"
    >
      {isFavorite ? "★" : "☆"}
    </button>
  );
}