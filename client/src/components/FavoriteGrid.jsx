import { Link } from "react-router-dom"
import "../styles/FavoritesGrid.css"

export default function FavoriteGrid({ favorites }) {
  if (!favorites || favorites.length === 0) {
    return <p className="text-gray-400">No favorite movies yet. ⭐</p>
  }

  // Sort by created_at descending and take the 4 most recent
  const recentFavorites = [...favorites]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {recentFavorites.map((fav) => (
        <Link to={`/movie/${fav.movie_id}`} key={fav.movie_id} className="relative group">
          <div className="movie-card rounded-xl overflow-hidden shadow-xl transform transition hover:scale-105 hover:shadow-2xl">
            {fav.poster_path ? (
              <img
                src={`${fav.poster_path}`}
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
      ))}
    </div>
  )
}
