import "../styles/MovieCard.css";
import { Link } from "react-router-dom";

function MovieCard({ movie }) {
  const dateStr = movie.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Unknown";

  return (
    <Link to={`/movie/${movie.id}`} className="movie-card">
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
      <div className="movie-overlay">
        <h4>{movie.title}</h4>
        <p>{dateStr}</p>
      </div>
    </Link>
  );
}

export default MovieCard;
