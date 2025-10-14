import React from "react";
import { Link } from "react-router-dom";
import Carousel from "../Carousel";
import errorlogo from "../images/404.png"

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
          const movieLink = movie.tmdbId ? `/movie/${movie.tmdbId}` : "#";
          const posterSrc =
            movie.image || errorlogo;

          return (
            <Link to={movieLink} className="movie-card">
              <img
                src={posterSrc}
                alt={movie.title}
                onError={(e) => {
                  e.target.src = errorlogo;
                }}
              />
              <div className="movie-overlay">
                <h4>{movie.title}</h4>
              </div>
            </Link>
          );
        }}
      />
    </section>
  );
}

export default NowPlayingMovies;