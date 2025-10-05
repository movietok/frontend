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
import { getNowInTheatres } from "../services/finnkino";

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

    // ✅ Fetch most active users
    getUsersByReviewCount()
      .then((data) => {
        setActiveUsers(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Failed to load active users:", err));

    // ✅ Fetch most popular users
    getUsersByAura()
      .then((data) => {
        setPopularUsers(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Failed to load popular users:", err));

    // ✅ Real data for popular groups
    getPopularGroups(20)
      .then((data) => {
        console.log("✅ Popular groups fetched:", data);
        setGroups(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Failed to load popular groups:", err));

    // ✅ Fetch currently showing movies (Finnkino)
getNowInTheatres()
  .then((data) => {
    console.log("🎬 Now in Theatres fetched:", data.length, "movies");
    setFinnkino(Array.isArray(data) ? data.slice(0, 20) : []);
  })
  .catch((err) => console.error("Failed to load NowInTheatres:", err));

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
