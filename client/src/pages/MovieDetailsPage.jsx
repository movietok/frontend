import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMovieDetails } from "../services/tmdb";
import { getMovieReviews } from "../services/reviews";
import Carousel from "../components/Carousel";
import CreateReview from "../components/CreateReview";
import ReviewCard from "../components/ReviewCard";
import "../styles/MovieDetailsPage.css";

function MovieDetailsPage({ currentUserId }) {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState("");

  // Fetch movie details
  useEffect(() => {
    getMovieDetails(id)
      .then((data) => setMovie(data))
      .catch(console.error)
      .finally(() => setLoadingMovie(false));
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoadingReviews(true);
        const data = await getMovieReviews(id);
        setReviews(data.reviews);
        setStats(data.stats);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingReviews(false);
      }
    }
    fetchReviews();
  }, [id]);

  // Add new review
  const handleReviewAdded = (review) => {
    setReviews((prev) => [review, ...prev]);
  };

  // Delete review
  const handleReviewDeleted = (reviewId) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

// In MovieDetailsPage.jsx, replace your handler with this:
const handleReviewUpdated = (updated) => {
  if (!updated || !updated.id) return; // <— guard: never insert undefined
  setReviews((prev) =>
    prev.map((r) => (r.id === updated.id ? updated : r))
  );
};

  if (loadingMovie) return <p>Loading...</p>;
  if (!movie) return <p>Movie not found</p>;

  return (
    <div className="movie-details-page">
      {/* Top Section */}
      <div className="movie-header">
        <img
          src={
            movie.posterPath ||
            "https://via.placeholder.com/200x300?text=No+Image"
          }
          alt={movie.title}
          className="movie-poster"
        />
        <div className="movie-info">
          <h1 className="movie-title">{movie.title}</h1>
          {movie.tagline && (
            <p className="movie-tagline">"{movie.tagline}"</p>
          )}
          <p className="movie-meta">
            ⭐ {movie.voteAverage?.toFixed(1) || "N/A"} •{" "}
            {movie.releaseDate?.slice(0, 4)} • {movie.runtime} min
          </p>
          <p className="movie-genres">{movie.genres.join(", ")}</p>
          {movie.trailer?.url && (
            <a
              href={movie.trailer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="trailer-btn"
            >
              🎬 Watch Trailer
            </a>
          )}
        </div>
      </div>

      {/* Overview + Facts */}
      <div className="overview-facts">
        <div className="overview">
          <h2>Overview</h2>
          <p>{movie.overview || "No overview available."}</p>
        </div>
        <div className="facts-box">
          <h3>Facts</h3>
          <ul>
            {movie.budget ? (
              <li>Budget: ${movie.budget.toLocaleString()}</li>
            ) : null}
            {movie.revenue ? (
              <li>Revenue: ${movie.revenue.toLocaleString()}</li>
            ) : null}
          </ul>
        </div>
      </div>

      {/* Cast Carousel */}
      <section className="cast-section">
        <h2>Cast</h2>
        <Carousel
          items={movie.cast}
          cardWidth={150}
          renderItem={(actor) => (
            <div className="person-card" key={actor.id}>
              {actor.profilePath ? (
                <img src={actor.profilePath} alt={actor.name} />
              ) : (
                <div className="no-image">No Image</div>
              )}
              <p className="person-name">{actor.name}</p>
              {actor.character && (
                <p className="person-role">as {actor.character}</p>
              )}
            </div>
          )}
        />
      </section>

      {/* Crew Carousel */}
      <section className="crew-section">
        <h2>Key Crew</h2>
        <Carousel
          items={movie.keyCrew}
          cardWidth={150}
          renderItem={(crew) => (
            <div className="person-card" key={crew.id}>
              {crew.profilePath ? (
                <img src={crew.profilePath} alt={crew.name} />
              ) : (
                <div className="no-image">No Image</div>
              )}
              <p className="person-name">{crew.name}</p>
              <p className="person-role">{crew.job}</p>
            </div>
          )}
        />
      </section>

      {/* Community Reviews */}
      <section className="reviews-section">
        <h2>Community Reviews</h2>

        {/* Create Review */}
        <CreateReview movieId={id} onReviewAdded={handleReviewAdded} />

        {loadingReviews ? (
          <p>Loading reviews...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : reviews.length === 0 ? (
          <p>No reviews yet. Be the first to review!</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((rev) => (
              <ReviewCard
                key={rev.id}
                review={rev}
                currentUserId={currentUserId}
                onDeleted={handleReviewDeleted}
                onUpdated={handleReviewUpdated}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default MovieDetailsPage;
