import React from "react"
import { Link } from "react-router-dom"
import Carousel from "../Carousel"

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
        renderItem={(review) => (
          <div className="review-card">
            <div>
              <Link to={`/movies/${review.movieId}`}>
                <h3>{review.movie}</h3>
              </Link>
              <p>
                <Link to={`/profile/${review.userId}`}>
                  <strong>{review.user}</strong>
                </Link>{" "}
                – {"⭐".repeat(review.rating)}
              </p>
            </div>
            <p className="review-text">{review.text}</p>
            <Link
              to={`/movies/${review.movieId}#review-${review.id}`}
              className="review-btn"
            >
              See more
            </Link>
          </div>
        )}
      />
    </section>
  )
}

export default RecentReviews
