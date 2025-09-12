import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:3001" })

export const fetchAreas = () => API.get("/finnkino/areas")
export const fetchSchedule = (area, date) =>
  API.get("/finnkino/schedule", { params: { area, date } })
