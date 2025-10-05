import React from "react"
import { Link } from "react-router-dom"
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
        renderItem={(movie) => {
          const movieLink = movie.tmdbId ? `/movie/${movie.tmdbId}` : '#'
          
          return (
            <Link to={movieLink} className="movie-card-link" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="movie-card">
                <img 
                  src={movie.image || 'https://via.placeholder.com/200x300?text=No+Image'} 
                  alt={movie.title}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200x300?text=No+Image'
                  }}
                />
                <div className="movie-overlay">
                  <h4>{movie.title}</h4>
                  <p>⭐ {movie.rating ? movie.rating.toFixed(1) : "N/A"}</p>
                  {movie.year && <p className="movie-year">{movie.year}</p>}
                </div>
              </div>
            </Link>
          )
        }}
      />
    </section>
  )
}

export default NowPlayingMovies
