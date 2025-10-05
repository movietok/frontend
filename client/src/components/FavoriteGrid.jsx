import { Link } from "react-router-dom"
import FavoriteButton from "./buttons/FavoriteButton"
import WatchlistButton from "./buttons/WatchlistButton"
import "../styles/FavoritesGrid.css"

export default function FavoriteGrid({ favorites, type = 2 }) {
  if (!favorites || favorites.length === 0) {
    return (
      <p className="text-gray-400">
        {type === 1 ? "No movies in your watchlist yet. 👁" : "No favorite movies yet. ⭐"}
      </p>
    )
  }

  const recentFavorites = [...favorites]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {recentFavorites.map((fav) => (
        <div key={fav.tmdb_id} className="relative group">
          <Link to={`/movie/${fav.tmdb_id}`}>
            <div className="movie-card rounded-xl overflow-hidden shadow-xl transform transition hover:scale-105 hover:shadow-2xl">
              {fav.poster_url ? (
                <img
                  src={`${fav.poster_url}`}
                  alt={fav.original_title}
                  className="w-full h-auto"
                />
              ) : (
                <div className="bg-gray-800 text-white flex items-center justify-center h-64">
                  No image
                </div>
              )}
              <div className="movie-meta p-2 text-center bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 w-full">
                <p className="text-white font-semibold text-sm truncate">{fav.original_title}</p>
                {fav.release_year && (
                  <p className="text-gray-300 text-xs">{fav.release_year}</p>
                )}
              </div>
            </div>
          </Link>

          {type === 2 && (
            <FavoriteButton
              tmdbId={fav.tmdb_id}
              type={2}
              initialIsFavorite={true}
              movieData={fav}
              disableAutoCheck={true}
            />
          )}
          {type === 1 && (
            <WatchlistButton
              tmdbId={fav.tmdb_id}
              initialIsWatchlist={true}
              onStatusChange={() => {}}
            />
          )}
        </div>
      ))}
    </div>
  )
}