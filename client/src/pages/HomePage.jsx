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

  const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

  useEffect(() => {
    // -------------------------------
    // ✅ POPULAR MOVIES (with caching)
    // -------------------------------
    const POPULAR_CACHE_KEY = "homepage_popular_movies";

    const cachedPopular = sessionStorage.getItem(POPULAR_CACHE_KEY);
    if (cachedPopular) {
      try {
        const { data, timestamp } = JSON.parse(cachedPopular);
        const isExpired = Date.now() - timestamp > CACHE_DURATION;

        if (!isExpired && Array.isArray(data) && data.length > 0) {
          console.log("✅ Using cached Popular Movies:", data.length);
          setMovies(data);
        } else {
          fetchPopularMovies();
        }
      } catch {
        fetchPopularMovies();
      }
    } else {
      fetchPopularMovies();
    }

    function fetchPopularMovies() {
      console.log("🔄 Fetching fresh Popular Movies...");
      discoverMovies({ page: 1 })
        .then((data) => {
          const movies = Array.isArray(data?.results)
            ? data.results.slice(0, 20)
            : [];
          setMovies(movies);
          sessionStorage.setItem(
            POPULAR_CACHE_KEY,
            JSON.stringify({ data: movies, timestamp: Date.now() })
          );
        })
        .catch(console.error);
    }

    // -------------------------------
    // ✅ FINNKINO "Now In Theatres" (with caching)
    // -------------------------------
    const FINNKINO_CACHE_KEY = "finnkino_now_playing";
    const cachedFinnkino = sessionStorage.getItem(FINNKINO_CACHE_KEY);

    if (cachedFinnkino) {
      try {
        const { data, timestamp } = JSON.parse(cachedFinnkino);
        const isExpired = Date.now() - timestamp > CACHE_DURATION;

        if (!isExpired && Array.isArray(data) && data.length > 0) {
          console.log("✅ Using cached Finnkino data:", data.length, "movies");
          setFinnkino(data);
        } else {
          fetchFinnkino();
        }
      } catch {
        fetchFinnkino();
      }
    } else {
      fetchFinnkino();
    }

    function fetchFinnkino() {
      console.log("🔄 Fetching Finnkino NowInTheatres...");
      getNowInTheatres()
        .then((data) => {
          console.log("🎬 Now in Theatres fetched:", data.length, "movies");
          const list = Array.isArray(data) ? data.slice(0, 20) : [];
          setFinnkino(list);
          sessionStorage.setItem(
            FINNKINO_CACHE_KEY,
            JSON.stringify({ data: list, timestamp: Date.now() })
          );
        })
        .catch((err) => console.error("Failed to load NowInTheatres:", err));
    }

    // -------------------------------
    // ✅ REAL DATA FOR OTHER SECTIONS
    // -------------------------------
    // Recent Reviews
    getRecentReviews()
      .then((data) => {
        console.log("✅ Recent reviews fetched:", data);
        setReviews(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Failed to load recent reviews:", err));

    // Most Active Users
    getUsersByReviewCount()
      .then((data) => {
        setActiveUsers(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Failed to load active users:", err));

    // Most Popular Users
    getUsersByAura()
      .then((data) => {
        setPopularUsers(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Failed to load popular users:", err));

    // Popular Groups
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
