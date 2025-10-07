import { Link } from "react-router-dom";
import MovieActionsBar from "./MovieActionBar";
import "../styles/FavoritesGrid.css";

export default function FavoriteGrid({ favorites, type = 2, userId, limit = 4, watchlist = [] }) {
  if (!favorites || favorites.length === 0) {
    return (
      <p className="text-gray-400">
        {type === 1 ? "No movies in this watchlist yet. 👁" : "No favorite movies yet. ⭐"}
      </p>
    );
  }

  // Sort and slice
  const sorted = [...favorites].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const displayed = limit ? sorted.slice(0, limit) : sorted;
  const viewAllPath = type === 1 ? `/watchlist/${userId}` : `/favorites/${userId}`;

  // ✅ Cross-check watchlist
  const watchlistIds = new Set(watchlist.map((m) => m.tmdb_id));
  const enhanced = displayed.map((fav) => ({
    ...fav,
    isWatchlist: watchlistIds.has(fav.tmdb_id),
  }));

  return (
    <div>
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {enhanced.map((fav) => (
          <div key={fav.tmdb_id} className="relative group">
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

            <div className="actions-hover-wrapper opacity-0 group-hover:opacity-100 transition-opacity duration-0">
              <MovieActionsBar
                tmdbId={fav.tmdb_id}
                type={type}
                groupId={fav.group_id ?? null}
                initialIsFavorite={type === 2}
                initialIsWatchlist={fav.isWatchlist || false}
                movieData={fav}
                showGroupButton={!!fav.group_id}
              />
            </div>
          </div>
        ))}
      </div>

      {limit && (
        <div className="mt-4 text-right">
          <Link
            to={viewAllPath}
            className="inline-block text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition duration-150 ease-in-out"
          >
            View All {type === 1 ? "Watchlist" : "Favorites"} →
          </Link>
        </div>
      )}
    </div>
  );
}
