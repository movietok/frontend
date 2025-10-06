import { useState, useEffect } from "react";
import {
  deleteReview,
  updateReview,
  addReviewInteraction,
} from "../services/reviews";
import "../styles/ReviewCard.css";
import { Link } from "react-router-dom";

function ReviewCard({
  review,
  currentUserId,
  onDeleted,
  onUpdated,
  showMovieHeader = false, // ✅ Only true in GroupDetailsPage
}) {
  console.log("🎬 ReviewCard props check:", {
  id: review?.id,
  movie_id: review?.movie_id,
  movieId: review?.movieId,
  movie_name: review?.movie_name,
  movieName: review?.movieName,
  poster_url: review?.poster_url,
  posterUrl: review?.posterUrl,
  release_year: review?.release_year,
  releaseYear: review?.releaseYear,
  showMovieHeader
});

  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [comment, setComment] = useState(review?.content ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [temporaryInteraction, setTemporaryInteraction] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const [expanded, setExpanded] = useState(false);
  const maxPreviewLength = 300;

  // ✅ Ownership detection
  useEffect(() => {
    if (!review || !currentUserId) return;
    const reviewUserId = Number(review.userId ?? review.user_id);
    const normalizedCurrent = Number(currentUserId);
    setIsOwner(reviewUserId === normalizedCurrent);
  }, [review?.userId, review?.user_id, currentUserId]);

  if (!review) return <div className="review-card">Loading review...</div>;

  const likes = Number(review.likes ?? 0);
  const dislikes = Number(review.dislikes ?? 0);
  const score = likes - dislikes;

  const handleDelete = async () => {
    try {
      await deleteReview(review.id);
      onDeleted(review.id);
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = await updateReview(review.id, { rating, comment });
      onUpdated(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInteraction = async (type) => {
    try {
      if (!review?.id) throw new Error("Review ID missing on interaction");
      setTemporaryInteraction(type);
      const updated = await addReviewInteraction(review.id, type);
      if (updated && updated.id) onUpdated(updated);
      setTimeout(() => setTemporaryInteraction(null), 500);
    } catch (err) {
      setError(err.message);
    }
  };

  const isLong = review.content?.length > maxPreviewLength;
  const displayedText = expanded
    ? review.content
    : isLong
    ? review.content.slice(0, maxPreviewLength) + "..."
    : review.content;

  // ✅ Inline Movie Header (for GroupDetailsPage only)
  const MovieHeader = () => {
    // Handle both snake_case and camelCase keys
    const movieId = review.movie_id ?? review.movieId;
    const movieTitle = review.movie_name ?? review.movieName;
    const moviePoster = review.poster_url ?? review.posterUrl;
    const movieYear = review.release_year ?? review.releaseYear;

    if (!showMovieHeader || !movieTitle) return null;

    return (
      <div className="review-movie-inline-header">
        <Link to={`/movie/${movieId}`} className="review-movie-inline-link">
          <img
            src={
              moviePoster ||
              "https://via.placeholder.com/80x120?text=No+Poster"
            }
            alt={movieTitle}
            className="review-movie-inline-poster"
          />
          <div className="review-movie-inline-info">
            <h3>{movieTitle}</h3>
            {movieYear && <span>{movieYear}</span>}
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div className={`review-card ${showDeleteModal ? "modal-open" : ""}`}>
      <MovieHeader />

      {isEditing ? (
        <div className="review-edit-box">
          <label className="edit-label">
            Rating:
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="edit-select"
            >
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="edit-textarea"
            placeholder="Update your review..."
          />
          <div className="edit-buttons">
            <button onClick={handleSave} disabled={loading} className="save-btn">
              {loading ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setIsEditing(false)} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* ===== Review Header ===== */}
          <div className="review-header">
            <div className="review-meta">
              <strong>⭐ {review.rating}</strong> —{" "}
              <span className="username">
                <Link
                  to={`/profile/${review.userId ?? review.user_id}`}
                  className="username-link"
                >
                  {review.username || `User ${review.userId ?? review.user_id}`}
                </Link>
              </span>
              <small>
                • {new Date(review.created_at).toLocaleString()}
                {review.updated_at &&
                  review.updated_at !== review.created_at && (
                    <span className="edited-tag"> (edited)</span>
                  )}
              </small>
            </div>

            <div className="review-interactions">
              <button
                className={`dislike-btn ${
                  temporaryInteraction === "dislike" ? "active" : ""
                }`}
                disabled={isOwner}
                onClick={() => handleInteraction("dislike")}
              >
                👎
              </button>
              <span
                className={`score ${
                  score > 0 ? "positive" : score < 0 ? "negative" : ""
                }`}
              >
                {score > 0 ? `+${score}` : score}
              </span>
              <button
                className={`like-btn ${
                  temporaryInteraction === "like" ? "active" : ""
                }`}
                disabled={isOwner}
                onClick={() => handleInteraction("like")}
              >
                👍
              </button>
            </div>
          </div>

          {/* ===== Review Body ===== */}
          <div className="review-body">
            {displayedText}
            {isLong && (
              <button
                className="read-more-btn"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Read less" : "Read more"}
              </button>
            )}
          </div>

          {/* ===== Owner Buttons ===== */}
          {isOwner && (
            <div className="review-actions-bottom">
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== Inline Delete Confirmation ===== */}
      {showDeleteModal && (
        <div
          className="inline-delete-overlay"
          onMouseLeave={() => setShowDeleteModal(false)}
        >
          <div className="inline-delete-modal">
            <p>Are you sure you want to delete this review?</p>
            <div className="delete-modal-buttons">
              <button className="confirm-delete" onClick={handleDelete}>
                Yes, Delete
              </button>
              <button
                className="cancel-delete"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default ReviewCard;
