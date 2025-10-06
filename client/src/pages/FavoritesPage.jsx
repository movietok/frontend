import { useParams, Link } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites";
import MovieActionBar from "../components/MovieActionBar";
import "../styles/FavoritesPage.css";

export default function FavoritesPage() {
  const { userId } = useParams(); 

  const { favorites: rawFavorites, loading, error } = useFavorites(userId, 2); // ✅ public favorites
  const { favorites: watchlist } = useFavorites(userId, 1); // ✅ public watchlist for cross-check

  const watchlistIds = new Set(watchlist.map((m) => m.tmdb_id));
  const favorites = rawFavorites.map((fav) => ({
    ...fav,
    isWatchlist: watchlistIds.has(fav.tmdb_id),
  }));

  if (loading) return <div className="favorites-loading">Loading favorites...</div>;
  if (error) return <div className="favorites-error">Error loading favorites.</div>;

  return (
    <div className="favorites-container max-w-6xl mx-auto px-6 py-8">
      <h2 className="favorites-header">
        <span className="favorites-star">★</span>
        <span className="favorites-text">Favorites</span>
      </h2>

      {favorites.length === 0 ? (
        <p className="text-gray-400">This user has no favorite movies yet. ⭐</p>
      ) : (
        <div className="favorites-grid">
          {favorites.map((fav) => (
            <div key={fav.tmdb_id} className="movie-card group">
              <Link to={`/movie/${fav.tmdb_id}`}>
                <div className="poster-container">
                  {fav.poster_url ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${fav.poster_url}`}
                      alt={fav.original_title}
                      className="poster-image"
                    />
                  ) : (
                    <div className="poster-placeholder">No image</div>
                  )}
                  <div className="poster-overlay group-hover:opacity-100">
                    <div className="overlay-header">
                      <p className="title">{fav.original_title}</p>
                      <p className="meta">
                        {fav.release_year} • IMDb {fav.imdb_rating ?? "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              <div className="actions-hover-wrapper">
                <MovieActionBar
                  tmdbId={fav.tmdb_id}
                  type={2}
                  initialIsFavorite={true}
                  initialIsWatchlist={fav.isWatchlist || false}
                  movieData={{
                    original_title: fav.original_title,
                    release_year: fav.release_year,
                    poster_path: fav.poster_url,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
