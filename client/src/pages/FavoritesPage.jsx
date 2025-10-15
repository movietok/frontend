import { useParams, Link } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites";
import { useProfile } from "../hooks/useProfile";
import MovieActionBar from "../components/MovieActionBar";
import "../styles/FavoritesPage.css";
import "../styles/ResponsiveMovieGrid.css";

export default function FavoritesPage() {
  const { userId } = useParams(); 
  const { user, loading: profileLoading, error: profileError } = useProfile(userId);
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
    <div className="favorites-container">
      <h2 className="favorites-header">
        <span className="favorites-star">★</span>
        <span className="favorites-text">
          {user?.username ? `Favorites of ${user.username}` : "Favorites"}
        </span>
      </h2>

      {favorites.length === 0 ? (
        <p className="text-gray-400">This user has no favorite movies yet. ⭐</p>
      ) : (
        <div className="favorites-grid responsive-movie-grid">
          {favorites.map((fav) => (
           <div key={fav.tmdb_id} className="favorites-grid-item responsive-movie-grid__item movie-hover-wrapper group">
            <Link to={`/movie/${fav.tmdb_id}`}>
              <div className="movie-card rounded-xl overflow-hidden shadow-xl transform transition hover:scale-105 hover:shadow-2xl">
                {fav.poster_url ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${fav.poster_url}`}
                    alt={fav.original_title}
                    className="poster-image group-hover:brightness-75 transition duration-300"
                  />
                ) : (
                  <div className="poster-placeholder">No image</div>
                )}

                <div className="poster-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-center">
                  <div className="overlay-header">
                    <p className="title">{fav.original_title}</p>
                    <p className="meta">{fav.release_year} • IMDb {fav.imdb_rating ?? "N/A"}</p>
                  </div>
                </div>
              </div>
            </Link>

  <div className="movie-actions-bar">
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
