import { useState } from "react";
import { createReview } from "../services/reviews";
import "../styles/CreateReview.css";

function CreateReview({ movieId, onReviewAdded }) {
  const hasToken = !!localStorage.getItem("token");
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!hasToken) {
  return <p><strong>You must be logged in to submit a review.</strong></p>;
}

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const newReview = await createReview({ movieId, rating, comment });
      onReviewAdded?.(newReview); // normalized with username
      setComment("");
      setRating(3);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-review-card">
      <h3>Write a Review</h3>
      <form onSubmit={handleSubmit}>
        <label>
          Rating:
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                {r} Star{r > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </label>

        <textarea
          placeholder="What did you think of this movie?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Posting..." : "Post Review"}
        </button>
      </form>
    </div>
  );
}

export default CreateReview;
