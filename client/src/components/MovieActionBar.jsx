// src/components/MovieActionsBar.jsx
import FavoriteButton from "./buttons/FavoriteButton"
import WatchlistButton from "./buttons/WatchlistButton"
import GroupFavoritesButton from "./buttons/GroupFavoritesButton"
import "../styles/MovieActionBar.css"

export default function MovieActionsBar({
  tmdbId,
  type = 2,
  groupId = null,
  initialIsFavorite = false,
  initialIsWatchlist = false,
  movieData = {},
  onStatusChange = null,
  showGroupButton = false
}) {
  return (
    <div className="movie-actions-bar">
      <FavoriteButton
        tmdbId={tmdbId}
        type={type}
        groupId={groupId}
        initialIsFavorite={initialIsFavorite}
        disableAutoCheck={true}
        movieData={movieData}
        onStatusChange={onStatusChange}
      />
      <WatchlistButton
        tmdbId={tmdbId}
        initialIsWatchlist={initialIsWatchlist}
        onStatusChange={onStatusChange}
      />
      {showGroupButton && (
        <GroupFavoritesButton
          tmdbId={tmdbId}
          groupId={groupId}
          initialIsFavorite={initialIsFavorite}
          movieData={movieData}
          onStatusChange={onStatusChange}
        />
      )}
    </div>
  )
}
