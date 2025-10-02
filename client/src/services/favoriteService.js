import { favoritesAPI } from "./api"

// Add movie to favorites
export const addFavorite = async (movie_id, type, group_id, movieData = {}) => {
  const token = localStorage.getItem("token");
  const res = await favoritesAPI.post(
    "/",
    { movie_id, type, group_id, ...movieData },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return res.data;
}

// Remove movie from favorites
export const removeFavorite = async (movie_id, type, group_id) => {
  const token = localStorage.getItem("token")
  const url = group_id
    ? `/${movie_id}/${type}/group/${group_id}`
    : `/${movie_id}/${type}`

  const res = await favoritesAPI.delete(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

// Get user favorites (watchlist=1, favorites=2)
export const getUserFavorites = async (user_id, type) => {
  const token = localStorage.getItem("token") 
  const res = await favoritesAPI.get(`/user/${user_id}/${type}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data.data 
}

// Get group favorites
export const getGroupFavorites = async (group_id) => {
  const res = await favoritesAPI.get(`/group/${group_id}`)
  return res.data.data 
}

// Check if movie is in favorites
export const checkFavoriteStatus = async (movie_id) => {
  const token = localStorage.getItem("token")
  const res = await favoritesAPI.get(`/status/${movie_id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return res.data
}
