import { favoritesAPI } from "./api"

export const addFavorite = async (tmdb_id, type, group_id, movieData = {}) => {
  const token = localStorage.getItem("token")
  const payload = {
    movie_id: tmdb_id, 
    type,
    group_id,
    ...movieData
  }
  const res = await favoritesAPI.post("/", payload, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data
}

// Remove movie from favorites
export const removeFavorite = async (tmdb_id, type, group_id) => {
  const token = localStorage.getItem("token")
  const url = group_id
    ? `/${tmdb_id}/${type}/group/${group_id}`
    : `/${tmdb_id}/${type}`
  const res = await favoritesAPI.delete(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data
}

// Get user favorites (watchlist=1, favorites=2)
export const getUserFavorites = async (user_id, type) => {
  const token = localStorage.getItem("token")
  const res = await favoritesAPI.get(`/user/${user_id}/${type}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.data.data
}

// Get group favorites
export const getGroupFavorites = async (group_id) => {
  const res = await favoritesAPI.get(`/group/${group_id}`)
  return res.data.data 
}

// Check if movie(s) are in favorites
// Can accept single tmdb_id (number/string) or array of tmdb_ids
export const checkFavoriteStatus = async (tmdb_ids) => {
  const token = localStorage.getItem("token")
  const ids = Array.isArray(tmdb_ids) ? tmdb_ids : [tmdb_ids]
  const idsString = ids.join(",")
  const res = await favoritesAPI.get(`/status/${idsString}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
  return res.data
}
