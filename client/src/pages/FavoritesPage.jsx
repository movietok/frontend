import { useAuth } from "../context/AuthContext"
import { useFavorites } from "../hooks/useFavorites" 
import { Link } from "react-router-dom"
import FavoriteButton from "../components/buttons/FavoriteButton"
import "../styles/FavoritesPage.css"

/* 🔧 Mock favorites data for styling
const mockFavorites = [
  {
    movie_id: "tt0111161",
    original_title: "The Shawshank Redemption",
    release_year: 1994,
    imdb_rating: 9.3,
    tmdb_id: 278,
    poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg"
  },
  {
    movie_id: "tt1375666",
    original_title: "Inception",
    release_year: 2010,
    imdb_rating: 8.8,
    tmdb_id: 27205,
    poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"
  },
  {
    movie_id: "tt0133093",
    original_title: "The Matrix",
    release_year: 1999,
    imdb_rating: 8.7,
    tmdb_id: 603,
    poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg"
  },
  {
    movie_id: "tt0109830",
    original_title: "Forrest Gump",
    release_year: 1994,
    imdb_rating: 8.8,
    tmdb_id: 13,
    poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg"
  },
  {
    movie_id: "tt0088763",
    original_title: "Back to the Future",
    release_year: 1985,
    imdb_rating: 8.5,
    tmdb_id: 105,
    poster_path: "/fNOH9f1aA7XRTzl1sAOx9iF553Q.jpg"
  }
]
*/


export default function FavoritesPage() {
  const { user } = useAuth()

  const { favorites, loading, error } = useFavorites(user?.id, 2)

  if (loading) return <div className="favorites-loading">Loading favorites...</div>
  if (error) return <div className="favorites-error">Error loading favorites.</div>

  return (
    <div className="favorites-container max-w-6xl mx-auto px-6 py-8">
      <h2 className="favorites-header">
        <span className="favorites-star">★</span>
        <span className="favorites-text">My Favorites</span>
      </h2>
      {favorites.length === 0 ? (
        <p className="text-gray-400">You have no favorite movies yet. ⭐</p>
      ) : (
        <div className="favorites-grid">
          {favorites.map((fav) => (
            <div key={fav.movie_id} className="movie-card group">
              <Link to={`/movie/${fav.movie_id}`}>
                <div className="poster-container">
                  {fav.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${fav.poster_path}`}
                      alt={fav.original_title}
                      className="poster-image"
                    />
                  ) : (
                    <div className="poster-placeholder">No image</div>
                  )}
                  <div className="poster-overlay group-hover:opacity-100">
                    <div className="overlay-header">
                      <p className="title">{fav.original_title}</p>
                      <span className="favorite-emblem">★</span>
                    </div>
                    <p className="meta">{fav.release_year} • IMDb {fav.imdb_rating}</p>
                  </div>
                </div>
              </Link>
              <FavoriteButton
                movieId={fav.movie_id}
                type={2}
                initialIsFavorite={true} 
                movieData={{
                  title: fav.title || fav.original_title,
                  original_title: fav.original_title,
                  release_date: fav.release_year?.toString(),
                  poster_path: fav.poster_path
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}