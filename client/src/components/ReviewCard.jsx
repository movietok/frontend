import { useState } from "react";
import { deleteReview, updateReview, addReviewInteraction } from "../services/reviews";
import "../styles/ReviewCard.css";

function ReviewCard({ review, currentUserId, onDeleted, onUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [comment, setComment] = useState(review?.content ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userReaction, setUserReaction] = useState(null);
  const [pending, setPending] = useState(false);


  // Defensive: if review hasn’t loaded yet, don’t render
  if (!review) {
    return <div className="review-card">Loading review...</div>;
  }

  const isOwner = currentUserId === review.user_id;

  const likes = Number(review.likes ?? 0);
  const dislikes = Number(review.dislikes ?? 0);
  const score = likes - dislikes;

  const handleDelete = async () => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteReview(review.id);
      onDeleted(review.id);
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
  if (pending) return;
  if (!review?.id) return;

  try {
    setPending(true);

    // Optional: instant local highlight
    setUserReaction(type);

    const updated = await addReviewInteraction(review.id, type);
    if (updated && updated.id) {
      onUpdated(updated);
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setPending(false);
  }
};


  return (
    <div className="review-card">
      {isEditing ? (
        <div>
          <label>
            Rating:
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
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
          />
          <button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div>
          <div className="review-header">
            <strong>⭐ {review.rating}</strong> —{" "}
            {review.username || `User ${review.user_id}`}
            <small>
              {" "}
              • {new Date(review.created_at).toLocaleString()}
              {review.updated_at && (
                <> (edited {new Date(review.updated_at).toLocaleString()})</>
              )}
            </small>
            {/* Like/Dislike block */}
            <div className="review-interactions">
  <button
    className={`dislike-btn ${userReaction === "dislike" ? "active" : ""}`}
    disabled={isOwner || pending}
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
    className={`like-btn ${userReaction === "like" ? "active" : ""}`}
    disabled={isOwner || pending}
    onClick={() => handleInteraction("like")}
  >
    👍
  </button>
</div>

          </div>

          <p>{review.content}</p>

          {isOwner && (
            <div className="review-actions">
              <button onClick={() => setIsEditing(true)}>Edit</button>
              <button onClick={handleDelete}>Delete</button>
            </div>
          )}
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default ReviewCard;
