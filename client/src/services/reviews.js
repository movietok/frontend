// src/services/reviews.js
const token = () => localStorage.getItem("token");

// Ensure every review has consistent fields
const normalizeReview = (r) => ({
  ...r,
  username: r?.username ?? `User ${r?.user_id}`,
  likes: Number(r?.likes ?? 0),
  dislikes: Number(r?.dislikes ?? 0),
});

// Create a new review
export async function createReview({ movieId, rating, comment }) {
  const res = await fetch("/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
    },
    body: JSON.stringify({ movieId, rating, comment }),
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
    body: JSON.stringify({ rating, comment }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update review");

  return normalizeReview(json.data.review);
}

// ✅ Add like/dislike interaction
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

  const r = json.data.interaction; // ✅ instead of json.data.review
  return normalizeReview(r);
}

