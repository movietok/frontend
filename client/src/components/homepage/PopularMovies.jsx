import React from "react"
import Carousel from "../Carousel"

function PopularMovies({ movies }) {
  return (
    <section className="popular-movies">
      <div className="section-header">
        <h2>Popular Movies</h2>
        <p>Check out the most trending films right now</p>
      </div>
      <Carousel
        items={movies}
        cardWidth={200}
        renderItem={(movie) => (
          <div className="movie-card">
            <img src={movie.image} alt={movie.title} />
            <div className="movie-overlay">
              <h4>{movie.title}</h4>
              <p>⭐ {movie.rating || "N/A"}</p>
              <button className="bookmark-btn">🔖 Bookmark</button>
            </div>
          </div>
        )}
      />
    </section>
  )
}

export default PopularMovies
