import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMovieDetails } from "../services/tmdb";
import { getMovieReviews } from "../services/reviews";
import { addFavorite } from "../services/favoriteService";
import { getUserGroupsAPI } from "../services/groups";
import Carousel from "../components/Carousel";
import CreateReview from "../components/CreateReview";
import ReviewCard from "../components/ReviewCard";
import CopyLinkButton from "../components/CopyLinkButton";
import OnsitePopup from "../components/Popups/OnsitePopup";
import FavoriteButton from "../components/buttons/FavoriteButton";
import WatchlistButton from "../components/buttons/WatchlistButton";
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

  // ✅ On-site popup state
  const [popup, setPopup] = useState(null);

  // Auto-dismiss popup after 2.5s
  useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => setPopup(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [popup]);

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

  // Helper: normalize rank/role from API response
  const getRank = (g) =>
    String(
      g?.rank ??
        g?.role ??
        g?.user_role ??
        g?.membership_role ??
        g?.membership?.role ??
        g?.membership?.rank ??
        ""
    ).toLowerCase();

  // Only owner/moderator can add to group favorites
  const hasManagePermission = (g) => {
    const rank = getRank(g);
    return rank === "owner" || rank === "moderator" || rank === "mod" || rank === "admin";
  };

  // ✅ Fetch user groups (filter to owner/moderator)
  useEffect(() => {
    if (!user?.id && !user?.user_id) return;
    const uid = user.id || user.user_id;

    getUserGroupsAPI(uid)
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.groups || [];
        const eligible = list.filter(hasManagePermission);
        setGroups(eligible);

        // Reset selection if it’s no longer valid
        setSelectedGroup((prev) =>
          eligible.some((g) => String(g.id) === String(prev)) ? prev : ""
        );
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
    if (!selectedGroup) {
      setPopup({
        message: "Please select a group first.",
        type: "info",
      });
      return;
    }

    try {
      const res = await addFavorite(id, 3, selectedGroup);
      setPopup({
        message: res.message || "Added to group favorites!",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.status === 403
          ? "You don’t have permission to add favorites for this group."
          : err?.message || "Failed to add movie to group favorites.";
      setPopup({ message: msg, type: "error" });
    }
  }

  if (loadingMovie) return <p>Loading...</p>;
  if (!movie) return <p>Movie not found</p>;

  // ===== Conditional content flags =====
  const showOverview = !!(movie?.overview && movie.overview.trim().length > 0);
  // Adjust facts as needed if you add more fields later
  const showFacts = !!(movie?.budget || movie?.revenue);

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
          <div className="movie-title-row">
  <h1 className="movie-title">{movie.title}</h1>
  <CopyLinkButton label="🔗" className="title-copy-btn" title="Copy Movie Link" />
</div>
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

          {/* ===== Personal Actions (Watchlist + Favorites) ===== */}
          {user && (
         <div className="personal-favorite-box icon-only">
  <WatchlistButton tmdbId={id} title="Add to Watchlist" />
  <FavoriteButton tmdbId={id} type={2} title="Add to Favorites" />
</div>
          )}

          {/* ===== Group Favorites Section (only owner/moderator groups) ===== */}
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

      {/* ===== Overview + Facts (render only if content exists) ===== */}
      {(showOverview || showFacts) && (
        <div className="overview-facts">
          {showOverview && (
            <div className="overview">
              <h2>Overview</h2>
              <p>{movie.overview}</p>
            </div>
          )}

          {showFacts && (
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
          )}
        </div>
      )}

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

      {/* ✅ On-site popup */}
      {popup && (
        <OnsitePopup
          message={popup.message}
          type={popup.type}
          confirmText="OK"
          onConfirm={() => setPopup(null)}
        />
      )}
    </div>
  );
}

export default MovieDetailsPage;
