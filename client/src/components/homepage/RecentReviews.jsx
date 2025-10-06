import React from "react";
import { Link } from "react-router-dom";
import Carousel from "../Carousel";

function RecentReviews({ reviews = [] }) {
  const truncateUsername = (name, maxLen = 16) => {
    if (!name) return "Unknown";
    return name.length > maxLen ? name.slice(0, maxLen) + "..." : name;
  };

  return (
    <section className="recent-reviews">
      <div className="section-header">
        <h2>Most Recent Reviews</h2>
        <p>See what people are saying about the latest movies</p>
      </div>

      {reviews.length === 0 ? (
        <p className="text-gray-400 italic">No reviews yet.</p>
      ) : (
        <Carousel
          items={reviews}
          cardWidth={280}
          renderItem={(review) => (
            <div className="review-card" key={review.id}>
              {/* 🎬 Movie title */}
              <Link to={`/movie/${review.movie_id}`}>
                <h3>{review.movie_name || "Unknown Movie"}</h3>
              </Link>

              {/* 👤 Username + rating */}
              <p>
                <Link to={`/profile/${review.user_id}`}>
                  <strong>{truncateUsername(review.username)}</strong>
                </Link>{" "}
                – {"⭐".repeat(review.rating || 0)}
              </p>

              {/* 💬 Review text */}
              <p className="review-text">
                {review.content?.length > 120
                  ? review.content.slice(0, 120) + "..."
                  : review.content || "No review text"}
              </p>

              {/* 🔗 See more */}
              <Link
                to={`/movie/${review.movie_id}#review-${review.id}`}
                className="review-btn"
              >
                See more
              </Link>
            </div>
          )}
        />
      )}
    </section>
  );
}

export default RecentReviews;
