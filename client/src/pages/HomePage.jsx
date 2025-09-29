import React, { useState, useEffect } from "react";
import "../styles/homePage.css";
import logo from "../images/Movietoklogo.png";

import PopularMovies from "../components/homepage/PopularMovies";
import NowPlayingMovies from "../components/homepage/NowPlayingMovies";
import RecentReviews from "../components/homepage/RecentReviews";
import PopularGroups from "../components/homepage/PopularGroups";
import MostActiveUsers from "../components/homepage/MostActiveUsers";
import PopularUsers from "../components/homepage/PopularUsers";

import { discoverMovies } from "../services/tmdb"; // use same endpoint as BrowsePage

// keep all other mock data exactly as before
const mockFinnkino = Array.from({ length: 7 }, (_, i) => ({
  id: i + 101,
  title: `Finnkino Movie ${i + 1}`,
  image: `https://via.placeholder.com/200x300?text=Finnkino+${i + 1}`,
  rating: (Math.random() * 3 + 6).toFixed(1),
}));

const mockReviews = [
  { id: 1, movieId: 27205, movie: "Inception", userId: 1, user: "Alice", rating: 5, text: "Amazing movie..." },
  { id: 2, movieId: 102, movie: "The Matrix", userId: 2, user: "Bob", rating: 4, text: "Classic sci-fi..." },
];

const mockGroups = [
  { id: 1, name: "Sci-Fi Lovers", members: 120 },
  { id: 2, name: "Action Fans", members: 98 },
  { id: 3, name: "Indie Movie Club", members: 75 },
  { id: 4, name: "Horror Nights", members: 65 },
];

const mockActiveUsers = [
  { id: 1, username: "MovieBuff", reviews: 45 },
  { id: 2, username: "Cinephile42", reviews: 38 },
];

const mockPopularUsers = [
  { id: 3, username: "FilmGeek", likes: 210 },
  { id: 4, username: "ScreenJunkie", likes: 180 },
];

function HomePage() {
  const [movies, setMovies] = useState([]); // Popular Movies
  const [finnkino, setFinnkino] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [popularUsers, setPopularUsers] = useState([]);

  useEffect(() => {
    // Fetch Popular via discover, change later for another method if wanted (this is the same as Browse default)
    discoverMovies({ page: 1 })
      .then((data) => {
  // data.results is already normalized by TMDBService
  setMovies(Array.isArray(data?.results) ? data.results.slice(0, 20) : []);
})

      .catch(console.error);

    // keep mocks for the rest
    setFinnkino(mockFinnkino);
    setReviews(mockReviews);
    setGroups(mockGroups);
    setActiveUsers(mockActiveUsers);
    setPopularUsers(mockPopularUsers);
  }, []);

  return (
    <div className="homepage-container">
      <div className="logo-container">
        <img src={logo} alt="Movietok Logo" className="homepage-logo" />
      </div>

      <main className="homepage-main">
        <PopularMovies movies={movies} />
        <NowPlayingMovies movies={finnkino} />
        <RecentReviews reviews={reviews} />
        <PopularGroups groups={groups} />
        <MostActiveUsers users={activeUsers} />
        <PopularUsers users={popularUsers} />
      </main>
    </div>
  );
}

export default HomePage;
