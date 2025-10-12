// src/services/reviews.js
import api from "./api";
const token = () => localStorage.getItem("token");

// Normalize backend review -> frontend shape
const normalizeReview = (r) => ({
  id: r?.id,
  movieId: r?.movie_id,
  userId: r?.user_id,
  username: r?.username ?? `User ${r?.user_id}`,
  content: r?.content ?? r?.body ?? "",
  rating: Number(r?.rating ?? 0),
  likes: Number(r?.likes ?? 0),
  dislikes: Number(r?.dislikes ?? 0),
  created_at: r?.created_at,
  updated_at: r?.updated_at,
  interactions: Array.isArray(r?.interactions) ? r.interactions : [], //  Keep backend interaction data
});

// Create a new review
export async function createReview({ movieId, rating, comment }) {
  const res = await fetch("/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
    },
    // backend expects "content"
    body: JSON.stringify({ movieId, rating, content: comment }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create review");

  return normalizeReview(json.data.review);
}

// Fetch all reviews for a movie
export async function getMovieReviews(movieId) {
  const res = await fetch(`/api/reviews/movie/${movieId}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch reviews");

  const reviews = (json?.data?.reviews ?? []).map(normalizeReview);

  return {
    ...json.data,
    reviews,
  };
}

// Delete a review
export async function deleteReview(id) {
  const res = await fetch(`/api/reviews/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (res.status === 204) return true;
  const json = await res.json();
  throw new Error(json.message || "Failed to delete review");
}

// Update a review
export async function updateReview(id, { rating, comment }) {
  const res = await fetch(`/api/reviews/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    // backend expects "content"
    body: JSON.stringify({ rating, content: comment }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update review");

  return normalizeReview(json.data.review);
}

// Add like/dislike interaction
export async function addReviewInteraction(id, type) {
  const res = await fetch(`/api/reviews/${id}/interaction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ type }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update interaction");

  // backend returns { data: { interaction: <review> } }
  const r = json.data.interaction;
  return normalizeReview(r);
}

import { reviewAPI } from "./api"; // must be defined as axios instance pointing to /api/reviews

export const getRecentReviews = async (limit = 20) => {
  try {
    const res = await reviewAPI.get(`/recent?limit=${limit}`);
    return res.data?.data?.reviews || [];
  } catch (err) {
    console.error("Error fetching recent reviews:", err);
    return [];
  }
};

// Fetch users sorted by number of reviews
export const getUsersByReviewCount = async () => {
  try {
    const response = await api.get("/reviews/users-by-review-count");
    return response.data.data?.users || response.data || [];
  } catch (error) {
    console.error("Error fetching users by review count:", error);
    return [];
  }
};

// Fetch users sorted by aura (likes)
export const getUsersByAura = async () => {
  try {
    const response = await api.get("/reviews/users-by-aura");
    return response.data.data?.users || response.data || [];
  } catch (error) {
    console.error("Error fetching users by aura:", error);
    return [];
  }
};

//  Fetch reviews of movies in a group's favorites (for group activity)
export async function getGroupReviews(groupId) {
  try {
    const res = await fetch(`/api/reviews/group/${groupId}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to fetch group reviews");

    return (json?.data?.reviews || []).map(normalizeReview);
  } catch (err) {
    console.error("Error fetching group reviews:", err);
    return [];
  }
}
