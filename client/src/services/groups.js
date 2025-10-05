import axios from "axios";
import api from "./api"; // or the correct axios instance if you already have one

// Use env when you explicitly want a full URL; otherwise fall back to Vite proxy.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
const API_URL = `${API_BASE}/groups`;

// ---------- Themes ----------
export const getAllGroupThemes = async () => {
  const res = await axios.get(`${API_URL}/themes`, { withCredentials: true });
  return res.data;
};

// ---------- Discover / Search ----------
export const discoverGroups = async ({ withGenres = [], page = 1, limit = 20, matchType = "any" }) => {
  const params = new URLSearchParams();
  if (withGenres.length > 0) params.append("genres", withGenres.join(","));
  params.append("limit", limit);
  params.append("matchType", matchType);

  const res = await axios.get(`${API_URL}/by-genres?${params}`, { withCredentials: true });
  return res.data;
};

export const searchGroups = async (query, limit = 20) => {
  const res = await axios.get(`${API_URL}/search?query=${encodeURIComponent(query)}&limit=${limit}`, { withCredentials: true });
  return res.data;
};

// ---------- Details ----------
export const getGroupDetails = async (id) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_URL}/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};


// ---------- Create ----------
export const createGroup = async (groupData) => {
  const res = await axios.post(`${API_URL}`, groupData, {
    withCredentials: true,            // send auth cookie/JWT
    headers: { "Content-Type": "application/json" },
  });
  // Adjust if your backend returns a different shape
  return res.data.group || res.data;
};

// ✅ Fetch the most popular groups by member count
export const getPopularGroups = async (limit = 20) => {
  try {
    const response = await api.get(`/groups/popular?limit=${limit}`);

    // ✅ Adjusted to correctly return the inner array
    const groups = response.data?.data || [];
    return Array.isArray(groups) ? groups : [];
  } catch (error) {
    console.error("Error fetching popular groups:", error);
    return [];
  }
};