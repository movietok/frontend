import { authAPI} from "./api"

export const deleteAccount = async () => {
  const token = localStorage.getItem("token")
  return authAPI.delete("/profile", {
    headers: { Authorization: `Bearer ${token}` },
  })
}
