import React, { useState, useEffect } from "react";
import "../styles/homePage.css";
import logo from "../images/Movietoklogo.png";

import PopularMovies from "../components/homepage/PopularMovies";
import NowPlayingMovies from "../components/homepage/NowPlayingMovies";
import RecentReviews from "../components/homepage/RecentReviews";
import PopularGroups from "../components/homepage/PopularGroups";
import MostActiveUsers from "../components/homepage/MostActiveUsers";
import PopularUsers from "../components/homepage/PopularUsers";

import { discoverMovies, getNowInTheaters } from "../services/tmdb"; // use same endpoint as BrowsePage
import { getPopularGroups } from "../services/groups";
import {
  getRecentReviews,
  getUsersByReviewCount,
  getUsersByAura,
} from "../services/reviews";

// keep all other mock data exactly as before
const mockFinnkino = Array.from({ length: 7 }, (_, i) => ({
  id: i + 101,
  title: `Finnkino Movie ${i + 1}`,
  image: `https://via.placeholder.com/200x300?text=Finnkino+${i + 1}`,
  rating: (Math.random() * 3 + 6).toFixed(1),
}));


function HomePage() {
  const [movies, setMovies] = useState([]); // Popular Movies
  const [finnkino, setFinnkino] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [popularUsers, setPopularUsers] = useState([]);

  // Cache configuration
  const CACHE_DURATION = 1000 * 60 * 30 // 30 minutes

  useEffect(() => {
    // Fetch Popular Movies with caching
    const POPULAR_CACHE_KEY = 'homepage_popular_movies'
    
    // Check cache first for Popular Movies
    const cachedPopular = sessionStorage.getItem(POPULAR_CACHE_KEY)
    if (cachedPopular) {
      try {
        const { data, timestamp } = JSON.parse(cachedPopular)
        const isExpired = Date.now() - timestamp > CACHE_DURATION
        
        if (!isExpired && Array.isArray(data) && data.length > 0) {
          console.log('✅ Using cached Popular Movies data:', data.length, 'movies')
          setMovies(data)
        } else {
          // Fetch fresh if expired
          fetchPopularMovies()
        }
      } catch (error) {
        console.warn('⚠️ Failed to parse cached Popular Movies:', error)
        fetchPopularMovies()
      }
    } else {
      fetchPopularMovies()
    }
    
    function fetchPopularMovies() {
      console.log('🔄 Fetching fresh Popular Movies...')
      discoverMovies({ page: 1 })
        .then((data) => {
          // data.results is already normalized by TMDBService
          const movies = Array.isArray(data?.results) ? data.results.slice(0, 100) : []
          setMovies(movies)
          
          // Cache the data
          sessionStorage.setItem(POPULAR_CACHE_KEY, JSON.stringify({
            data: movies,
            timestamp: Date.now()
          }))
          console.log('✅ Cached Popular Movies:', movies.length)
        })
        .catch(console.error)
    }

    // Fetch Now Playing from backend (Finnkino + TMDB enriched)
    const NOW_PLAYING_CACHE_KEY = 'now_playing_movies'
    
    // Check cache first
    const cachedNowPlaying = sessionStorage.getItem(NOW_PLAYING_CACHE_KEY)
    if (cachedNowPlaying) {
      try {
        const { data, timestamp } = JSON.parse(cachedNowPlaying)
        const isExpired = Date.now() - timestamp > CACHE_DURATION
        
        if (!isExpired && Array.isArray(data) && data.length > 0) {
          console.log('✅ Using cached Now Playing data:', data.length, 'movies')
          setFinnkino(data)
        } else {
          fetchNowPlayingMovies()
        }
      } catch (error) {
        console.warn('⚠️ Failed to parse cached Now Playing data:', error)
        fetchNowPlayingMovies()
      }
    } else {
      fetchNowPlayingMovies()
    }
    
    function fetchNowPlayingMovies() {
      console.log('🔄 Fetching fresh Now Playing movies...')
      getNowInTheaters()
        .then((response) => {
          console.log('🎬 Fetched Now Playing:', response);
          
          if (response?.success && Array.isArray(response.results)) {
            // Format for NowPlayingMovies component
            const formatted = response.results.slice(0, 100).map(movie => ({
              id: movie.id,
              tmdbId: movie.id,
              finnkinoId: movie.f_id,
              title: movie.originalTitle,
              image: movie.posterPath || 'https://via.placeholder.com/200x300?text=No+Poster',
              year: movie.releaseYear,
              overview: movie.overview || ''
            }));
            
            console.log('✅ Formatted Now Playing movies:', formatted.length);
            
            // Cache the data
            sessionStorage.setItem(NOW_PLAYING_CACHE_KEY, JSON.stringify({
              data: formatted,
              timestamp: Date.now()
            }))
            
            setFinnkino(formatted);
          } else {
            console.warn('⚠️ Unexpected response format:', response)
            setFinnkino(mockFinnkino);
          }
        })
        .catch((error) => {
          console.error('❌ Error fetching Now Playing movies:', error);
          setFinnkino(mockFinnkino); // Fallback to mock data
        });
    }


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