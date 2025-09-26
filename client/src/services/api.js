import axios from "axios"

// Get base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"

const api = axios.create({
  baseURL: `${API_BASE_URL}/`, 
})

// Create a separate instance for user authentication endpoints
export const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/v1/users`,
})

// hae reviews 
export const reviewAPI = axios.create({
  baseURL: `${API_BASE_URL}/v1/reviews`,
})
// Hae teatterialueet
export const fetchAreas = async () => {
  const res = await api.get("/theatres")
  return res.data.theatreAreas // backend palauttaa theatreAreas
}

// Hae aikataulut
export const fetchSchedule = async (area, date) => {
  const params = {}
  if (area) params.area = area
  if (date) params.dt = date

  const res = await api.get("/schedule", { params })
  return res.data.schedule 
}

export const fetchMovies = async () => {
  const res = await api.get("/events") 
  return res.data.events
}

// Hae elokuvia hakusanalla
export const searchMovies = async (query) => {
  const res = await api.get("/tmdb/search", { 
    params: { query: query }
  })
  return res.data
}

export default api