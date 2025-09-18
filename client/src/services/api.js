import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:3000/api/finnkino", 
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

export default api