import { authAPI, reviewAPI} from "./api"

export const getProfile = async () => {
  const token = localStorage.getItem("token")
  const res = await authAPI.get("/profile", {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data.user
}

export const deleteAccount = async () => {
  const token = localStorage.getItem("token")
  return authAPI.delete("/profile", {
    headers: { Authorization: `Bearer ${token}` },
  })
}

  // Gets users reviews by id
export const getUserReviews = async (userId) => {
  const token = localStorage.getItem("token")
  const res = await reviewAPI.get(`/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data.data.reviews
}
