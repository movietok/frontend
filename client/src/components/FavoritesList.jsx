import { useFavorites } from "../hooks/useFavorites"

export default function FavoritesList({ userId, type }) {
  const { favorites, loading, error } = useFavorites(userId, type)

  if (loading) return <p>Loading favorites...</p>
  if (error) return <p>Error loading favorites.</p>
  if (favorites.length === 0) return <p>No favorites yet.</p>

  return (
    <div className="favorites-list">
      {favorites.map((fav) => (
        <div key={fav.tmdb_id} className="favorite-item">
          <span>{fav.original_title || `Movie #${fav.tmdb_id}`}</span>
        </div>
      ))}
    </div>
  )
}
