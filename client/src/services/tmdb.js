import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Fetch genres from backend (local DB)
export async function getGenres() {
  const res = await axios.get(`${API_BASE}/tmdb/genres`);
  return res.data;
}

export async function discoverMovies({ withGenres = [], page = 1 } = {}) {
  const params = new URLSearchParams();
  if (withGenres.length > 0) {
    params.append("with_genres", withGenres.join(",")); 
  }
  params.append("page", page);

  console.log("Discover API call:", `${API_BASE}/tmdb/discover?${params.toString()}`); // 👈 TEMP

  const res = await axios.get(`${API_BASE}/tmdb/discover?${params.toString()}`);
  return res.data;
}

export async function getPopularMovies(page = 1) {
  const res = await axios.get(`${API_BASE}/tmdb/popular?page=${page}`);
  return res.data;
}

export async function getMovieDetails(id) {
  const res = await axios.get(`${API_BASE}/tmdb/${id}`);
  return res.data;
}

// Search movie by original title and year
export async function searchMovieByTitleYear(originalTitle, year, finnkinoEventId = null) {
  try {
    const params = {
      originalTitle,
      year
    };
    
    // Add Finnkino Event ID if available
    if (finnkinoEventId) {
      params.f_id = finnkinoEventId;
    }
    
    console.log('🔍 TMDB search:', params);
    const res = await axios.get(`${API_BASE}/tmdb/title-year`, { params });
    return res.data;
  } catch (error) {
    console.error(`Error fetching TMDB data for ${originalTitle} (${year}):`, error);
    return null;
  }
}