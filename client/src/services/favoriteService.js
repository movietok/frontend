import { favoritesAPI } from "./api"

// Add movie to favorites
export const addFavorite = async (movie_id, type, group_id) => {
  const token = localStorage.getItem("token");
  const res = await favoritesAPI.post(
    "/",
    { movie_id, type, group_id },
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

// Check if movie(s) are in favorites
// Can accept single movie_id (number/string) or array of movie_ids
export const checkFavoriteStatus = async (movie_ids) => {
  const token = localStorage.getItem("token")
  
  // Handle both single ID and array of IDs
  const ids = Array.isArray(movie_ids) ? movie_ids : [movie_ids]
  const idsString = ids.join(',')
  
  const res = await favoritesAPI.get(`/status/${idsString}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  return res.data
}
