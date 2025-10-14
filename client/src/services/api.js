import axios from "axios"

// Get base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"

// 🔹 Axios instances for different API domains
export const api = axios.create({
  baseURL: `${API_BASE_URL}/`, 
})

// Create a separate instance for user authentication endpoints
export const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/v1/users`,
})

// Create a separate instance for group endpoints
export const groupAPI = axios.create({
  baseURL: `${API_BASE_URL}/groups`,
})
// Create a separate instance for review endpoints
export const reviewAPI = axios.create({
  baseURL: `${API_BASE_URL}/v1/reviews`,
})

// Create a separate instance for favorites endpoints
export const favoritesAPI = axios.create({
  baseURL: `${API_BASE_URL}/favorites`,
});

//  Global login validator interceptor (applied to all instances)
// DISABLED: This was causing unexpected logouts when viewing other users' profiles
// or when API calls fail temporarily. Auth should be handled in components, not globally.
// [authAPI, reviewAPI, api, favoritesAPI].forEach(instance => {
//   instance.interceptors.response.use(
//     response => response,
//     error => {
//       const token = localStorage.getItem("token")
//       const isLoginRequest = error.config?.url?.includes("/login")
//       if (
//         token && // Only if token exists 
//         !isLoginRequest && // Not for login requests
//         error.response &&
//         (error.response.status === 401 || error.response.status === 403)
//       ) {
//         localStorage.removeItem("token")
//         window.location.href = "/login"
//       }
//       return Promise.reject(error)
//     }
//   )
// })

//  Movie & schedule API methods
// Hae teatterialueet
/*
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

// Hae elokuvat
export const fetchMovies = async () => {
  const res = await api.get("/events") 
  return res.data.events
}
  */

// Hae elokuvia hakusanalla
export const searchMovies = async (query) => {
  const res = await api.get("/tmdb/search", { 
    params: { query: query }
  })
  return res.data
}

export default api
