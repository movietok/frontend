import React from "react"
import Carousel from "../Carousel"

function NowPlayingMovies({ movies }) {
  return (
    <section className="in-theaters">
      <div className="section-header">
        <h2>Currently in Theaters</h2>
        <p>Movies showing now (Finnkino)</p>
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

export default NowPlayingMovies
