import { authAPI, reviewAPI} from "./api"

export const getProfile = async () => {
  const token = localStorage.getItem("token")
  if (!token) {
    throw new Error('No authentication token found')
  }
  console.log('📝 Fetching own profile')
  const res = await authAPI.get("/profile", {
    headers: { Authorization: `Bearer ${token}` },
  })
  console.log('✅ Own profile fetched:', res.data.user)
  return res.data.user
}

// Get user profile by ID (public or authorized)
export const getProfileById = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required')
  }
  console.log('📝 Fetching profile for user ID:', userId)
  const token = localStorage.getItem("token")
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  
  try {
    const res = await authAPI.get(`/${userId}`, { headers })
    console.log('✅ User profile fetched:', res.data.user)
    return res.data.user
  } catch (err) {
    console.error('❌ Failed to fetch user profile:', err.response?.status, err.response?.data)
    throw err
  }
}

export const deleteAccount = async () => {
  const token = localStorage.getItem("token")
  return authAPI.delete("/profile", {
    headers: { Authorization: `Bearer ${token}` },
  })
}

  // update profile route
export const updateProfile = async (data) => {
  const token = localStorage.getItem("token")
  const res = await authAPI.put("/profile", data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data.user
}

  // Gets users reviews by id
export const getUserReviews = async (userId) => {
  const token = localStorage.getItem("token")
  const res = await reviewAPI.get(`/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data.data.reviews
}