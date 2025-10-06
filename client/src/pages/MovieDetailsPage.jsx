// src/pages/MovieDetailsPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMovieDetails } from "../services/tmdb";
import { getMovieReviews } from "../services/reviews";
import { addFavorite } from "../services/favoriteService";
import { getUserGroupsAPI } from "../services/groups"; // or create this if not existing
import Carousel from "../components/Carousel";
import CreateReview from "../components/CreateReview";
import ReviewCard from "../components/ReviewCard";
import "../styles/MovieDetailsPage.css";

function MovieDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const currentUserId = user?.id || user?.user_id;

  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState("");

  // ✅ Group favorites feature
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");

  useEffect(() => {
    getMovieDetails(id)
      .then((data) => setMovie(data))
      .catch(console.error)
      .finally(() => setLoadingMovie(false));
  }, [id]);

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

  // ✅ Fetch user groups (for dropdown)
 useEffect(() => {
  if (!user?.id && !user?.user_id) return;
  const uid = user.id || user.user_id;

  getUserGroupsAPI(uid)
    .then((data) => {
      console.log("Fetched user groups:", data); // optional debug
      setGroups(data);
    })
    .catch(console.error);
}, [user]);

  const handleReviewAdded = (review) => {
    setReviews((prev) => [review, ...prev]);
  };

  const handleReviewDeleted = (reviewId) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  const handleReviewUpdated = (updated) => {
    if (!updated || !updated.id) return;
    setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  // ✅ Add movie to group favorites
  async function handleAddToGroupFavorites() {
    if (!selectedGroup) return alert("Please select a group first.");
    try {
      const res = await addFavorite(id, 3, selectedGroup);
      alert(res.message || "Added to group favorites!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to add movie to group favorites.");
    }
  }

  if (loadingMovie) return <p>Loading...</p>;
  if (!movie) return <p>Movie not found</p>;

  return (
    <div className="movie-details-page">
      {/* ===== Top Section ===== */}
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

          {/* ✅ Add-to-group-favorites UI */}
          {user && groups.length > 0 && (
            <div className="group-favorite-box">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="group-select"
              >
                <option value="">Select Group...</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddToGroupFavorites}
                disabled={!selectedGroup}
                className="add-to-group-btn"
              >
                ➕ Add to Group Favorites
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== Overview + Facts ===== */}
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

      {/* ===== Cast Carousel ===== */}
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

      {/* ===== Crew Carousel ===== */}
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

      {/* ===== Community Reviews ===== */}
      <section className="reviews-section">
        <h2>Community Reviews</h2>

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
