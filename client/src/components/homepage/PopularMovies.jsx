import React from "react";
import { Link } from "react-router-dom";
import Carousel from "../Carousel";

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
          <Link to={`/movie/${movie.id}`} className="movie-card">
            {movie.posterPath ? (
              <img src={movie.posterPath} alt={movie.title} />
            ) : (
              <div className="movie-poster bg-gray-700 flex items-center justify-center text-sm">
                No Image
              </div>
            )}
            <div className="movie-overlay">
              <h4>{movie.title}</h4>
              <p>⭐ {movie.voteAverage?.toFixed(1) || "N/A"}</p>
            </div>
          </Link>
        )}
      />
    </section>
  );
}

export default PopularMovies;
