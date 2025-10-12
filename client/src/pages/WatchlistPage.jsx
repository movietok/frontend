import { Link } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites";
import { useAuth } from "../context/AuthContext";
import MovieActionBar from "../components/MovieActionBar";
import "../styles/FavoritesPage.css";

export default function WatchlistPage() {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user) {
    return (
      <div className="favorites-error">
        Please log in to view your watchlist. 🔒
      </div>
    );
  }

  const { favorites: watchlist, loading, error } = useFavorites(user.id, 1); // type 1 = watchlist

  if (loading) return <div className="favorites-loading">Loading watchlist...</div>;
  if (error) return <div className="favorites-error">Error loading watchlist.</div>;

  return (
    <div className="favorites-container">
      <h2 className="watchlist-header">
        <span className="watchlist-eye">👁</span>
        <span className="watchlist-text">Your Watchlist {user.username}</span>
      </h2>

      {watchlist.length === 0 ? (
        <p className="text-gray-400">Your watchlist is empty. 👀</p>
      ) : (
        <div className="favorites-grid">
          {watchlist.map((movie) => (
            <div key={movie.tmdb_id} className="movie-hover-wrapper group">
              <Link to={`/movie/${movie.tmdb_id}`}>
                <div className="movie-card rounded-xl overflow-hidden shadow-xl transform transition hover:scale-105 hover:shadow-2xl">
                  {movie.poster_url ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${movie.poster_url}`}
                      alt={movie.original_title}
                      className="poster-image group-hover:brightness-75 transition duration-300"
                    />
                  ) : (
                    <div className="poster-placeholder">No image</div>
                  )}

                  <div className="poster-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-center">
                    <div className="overlay-header">
                      <p className="title">{movie.original_title}</p>
                      <p className="meta">
                        {movie.release_year} • IMDb {movie.imdb_rating ?? "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              <div className="movie-actions-bar">
                <MovieActionBar
                  tmdbId={movie.tmdb_id}
                  type={1}
                  initialIsFavorite={false}
                  initialIsWatchlist={true}
                  movieData={{
                    original_title: movie.original_title,
                    release_year: movie.release_year,
                    poster_path: movie.poster_url,
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
