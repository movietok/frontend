import "../styles/MovieCard.css";

function MovieCard({ movie }) {
  const dateStr = movie.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Unknown";

  return (
    <div className="movie-card">
      {movie.posterPath ? (
        <img
          src={movie.posterPath}
          alt={movie.title}
          className="movie-poster"
        />
      ) : (
        <div className="movie-poster bg-gray-700 flex items-center justify-center text-sm">
          No Image
        </div>
      )}

      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <p className="movie-date">{dateStr}</p>
      </div>
    </div>
  );
}

export default MovieCard;
