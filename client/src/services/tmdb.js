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
