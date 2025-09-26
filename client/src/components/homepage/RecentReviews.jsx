import React from "react";
import { Link } from "react-router-dom";
import Carousel from "../Carousel";

function RecentReviews({ reviews }) {
  return (
    <section className="recent-reviews">
      <div className="section-header">
        <h2>Most Recent Reviews</h2>
        <p>See what people are saying about the latest movies</p>
      </div>
      <Carousel
        items={reviews}
        cardWidth={280}
        renderItem={(review) => {
          const isInception = review.movie.toLowerCase() === "inception";

          return (
            <div className="review-card">
              <div>
                {isInception ? (
                  <Link to="/movie/27205">
                    <h3>{review.movie}</h3>
                  </Link>
                ) : (
                  <h3 className="text-gray-400 cursor-not-allowed">{review.movie}</h3>
                )}

                <p>
                  <Link to={`/profile/${review.userId}`}>
                    <strong>{review.user}</strong>
                  </Link>{" "}
                  – {"⭐".repeat(review.rating)}
                </p>
              </div>

              <p className="review-text">{review.text}</p>

              {isInception ? (
                <Link to="/movie/27205#review-1" className="review-btn">
                  See more
                </Link>
              ) : (
                <span className="review-btn text-gray-400 cursor-not-allowed">
                  See more
                </span>
              )}
            </div>
          );
        }}
      />
    </section>
  );
}

export default RecentReviews;
