import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { useUserReviews } from "../hooks/useUserReviews";
import "../styles/ProfilePage.css";
import { useFavorites } from "../hooks/useFavorites";
import FavoriteGrid from "../components/FavoriteGrid";

function SectionDivider() {
  return <div className="section-divider" />;
}

export default function ProfilePage() {
  const { userId } = useParams();
  const { isLoggedIn, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Profile");

  const isOwnProfile = !userId || (currentUser?.id && userId === String(currentUser.id));

  const { user, loading, error } = useProfile(userId);

  // Only fetch watchlist if viewing own profile
  const { favorites: watchlist, loading: watchlistLoading, error: watchlistError } = useFavorites(
    isOwnProfile ? user?.id : null,
    1
  );

  // Always fetch favorites (public)
  const { favorites, loading: favoritesLoading, error: favoritesError } = useFavorites(user?.id, 2);
  const { reviews, loading: reviewsLoading, error: reviewsError } = useUserReviews(user?.id);

  useEffect(() => {
    if (isOwnProfile && !isLoggedIn) {
      navigate("/login");
    }
  }, [isOwnProfile, isLoggedIn, navigate]);

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (error) {
    console.error("Profile error:", error);
    return (
      <div className="profile-error">
        <h3>Error loading profile</h3>
        <p>{error.message || "Unknown error occurred"}</p>
        <p style={{ fontSize: "0.9em", color: "#666" }}>
          {userId ? `Tried to load user ID: ${userId}` : "Tried to load own profile"}
        </p>
      </div>
    );
  }
  if (!user) return <div className="profile-error">Profile not found.</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={`https://ui-avatars.com/api/?name=${user.username}`} alt="Avatar" />
        </div>
        <div className="profile-main">
          <div className="profile-username-row">
            <h2>
              {user.username}
              <span className="profile-user-id">(ID: {user.id})</span>
              {!isOwnProfile && (
                <span style={{ marginLeft: "10px", fontSize: "0.8em", color: "#888" }}>
                  (Viewing user's profile)
                </span>
              )}
            </h2>
          </div>

          <div className="profile-stats">
            <div>
              <span className="stat-number">{favoritesLoading ? "…" : favorites.length}</span>
              <span className="stat-label">FAVORITES</span>
            </div>
            <div>
              <span className="stat-number">0</span>
              <span className="stat-label">FOLLOWING</span>
            </div>
            <div>
              <span className="stat-number">0</span>
              <span className="stat-label">FOLLOWERS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        {["Profile", "Activity", "Favorites", "Reviews", ...(isOwnProfile ? ["Watchlist"] : [])].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="profile-content">
        <SectionDivider />

        {activeTab === "Profile" && (
          <>
            <div className="favorite-films">
              <span className="section-title">FAVORITE FILMS</span>
              <div className="favorite-films-content">
                Don’t forget to select your <b>favorite films!</b>
              </div>
            </div>
            <SectionDivider />
            <div className="my-groups">
              <span className="section-title">MY GROUPS</span>
              <div className="my-groups-content">
                <p>You are not a member of any groups yet.</p>
              </div>
            </div>
            <SectionDivider />
            <div className="my-reviews">
              <span className="section-title">MY REVIEWS</span>
              <div className="my-reviews-content">
                {reviewsLoading && <p>Loading reviews...</p>}
                {reviewsError && <p>Error loading reviews.</p>}
                {!reviewsLoading && reviews.length === 0 && <p>No reviews yet.</p>}
                {!reviewsLoading && reviews.length > 0 && (
                  <ul>
                    {reviews.map((review) => (
                      <li key={review.id}>
                        <b>Movie:</b> {review.tmdb_id} &nbsp;
                        <b>Rating:</b> {review.rating} &nbsp;
                        <b>Comment:</b> {review.content}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "Activity" && (
          <div>
            <span className="section-title">ACTIVITY</span>
            <div>Activity content goes here.</div>
          </div>
        )}

        {activeTab === "Favorites" && (
          <div>
            <span className="section-title">FAVORITES</span>
            <div className="favorites-content">
              {favoritesLoading && <p>Loading favorites...</p>}
              {favoritesError && <p>Error loading favorites.</p>}
              {!favoritesLoading && favorites.length === 0 && <p>No favorite movies yet. ⭐</p>}
              {!favoritesLoading && favorites.length > 0 && (
                <FavoriteGrid favorites={favorites} type={2} userId={user.id} limit={8} />
              )}
            </div>
          </div>
        )}

        {activeTab === "Reviews" && (
          <div>
            <span className="section-title">{isOwnProfile ? "MY REVIEWS" : "REVIEWS"}</span>
            <div className="my-reviews-content">
              {reviewsLoading && <p>Loading reviews...</p>}
              {reviewsError && <p>Error loading reviews.</p>}
              {!reviewsLoading && reviews.length === 0 && <p>No reviews yet.</p>}
              {!reviewsLoading && reviews.length > 0 && (
                <ul>
                  {reviews.map((review) => (
                    <li key={review.id}>
                      <b>Movie:</b> {review.tmdb_id} &nbsp;
                      <b>Rating:</b> {review.rating} &nbsp;
                      <b>Comment:</b> {review.content}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {isOwnProfile && activeTab === "Watchlist" && (
          <div>
            <span className="section-title">MY WATCHLIST</span>
            <div className="watchlist-content">
              {watchlistLoading && <p>Loading watchlist...</p>}
              {watchlistError && <p>Error loading watchlist.</p>}
              {!watchlistLoading && watchlist.length === 0 && <p>No movies in your watchlist yet. 👁</p>}
              {!watchlistLoading && watchlist.length > 0 && (
                <FavoriteGrid favorites={watchlist} type={1} userId={user.id} limit={null} />
              )}
            </div>
          </div>
        )}

        <SectionDivider />
      </div>
    </div>
  );
}
