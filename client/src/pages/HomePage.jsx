import React, { useState, useEffect } from "react";
import "../styles/homePage.css";
import logo from "../images/Movietoklogo.png";

import PopularMovies from "../components/homepage/PopularMovies";
import NowPlayingMovies from "../components/homepage/NowPlayingMovies";
import RecentReviews from "../components/homepage/RecentReviews";
import PopularGroups from "../components/homepage/PopularGroups";
import MostActiveUsers from "../components/homepage/MostActiveUsers";
import PopularUsers from "../components/homepage/PopularUsers";
import { getPopularGroups } from "../services/groups";
import { discoverMovies } from "../services/tmdb";
import {
  getRecentReviews,
  getUsersByReviewCount,
  getUsersByAura,
} from "../services/reviews";


const mockFinnkino = Array.from({ length: 7 }, (_, i) => ({
  id: i + 101,
  title: `Finnkino Movie ${i + 1}`,
  image: `https://via.placeholder.com/200x300?text=Finnkino+${i + 1}`,
  rating: (Math.random() * 3 + 6).toFixed(1),
}));

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
  const [movies, setMovies] = useState([]);
  const [finnkino, setFinnkino] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [popularUsers, setPopularUsers] = useState([]);

  useEffect(() => {
  // ✅ Fetch popular movies
  discoverMovies({ page: 1 })
    .then((data) => {
      setMovies(Array.isArray(data?.results) ? data.results.slice(0, 20) : []);
    })
    .catch(console.error);

  // ✅ Fetch recent reviews
  getRecentReviews()
    .then((data) => {
      console.log("✅ Recent reviews fetched:", data);
      setReviews(Array.isArray(data) ? data : []);
    })
    .catch((err) => console.error("Failed to load recent reviews:", err));

  // ✅ Fetch most active users (by review count)
  getUsersByReviewCount()
    .then((data) => {
      setActiveUsers(Array.isArray(data) ? data : []);
    })
    .catch((err) => console.error("Failed to load active users:", err));

  // ✅ Fetch most popular users (by aura/likes)
  getUsersByAura()
    .then((data) => {
      setPopularUsers(Array.isArray(data) ? data : []);
    })
    .catch((err) => console.error("Failed to load popular users:", err));

  // ✅ Keep mock data for now-playing and groups
  setFinnkino(mockFinnkino);
  getPopularGroups(20)
  .then((data) => {
    console.log("✅ Popular groups fetched:", data);
    setGroups(Array.isArray(data) ? data : []);
  })
  .catch((err) => console.error("Failed to load popular groups:", err));

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
