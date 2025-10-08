import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useProfile } from "../hooks/useProfile"
import { useUserGroups } from "../hooks/useUserGroups"
import { useUserReviews } from "../hooks/useUserReviews"
import { useFavorites } from "../hooks/useFavorites"
import { getAuraLabel } from "../helpers/GetActivity"
import FavoriteGrid from "../components/FavoriteGrid"
import GroupCard from "../components/GroupCard"
import ReviewCard from "../components/ReviewCard"
import "../styles/ProfilePage.css"

function SectionDivider() {
  return <div className="section-divider" />
}

export default function ProfilePage() {

const { userId } = useParams();
const { isLoggedIn, user: currentUser } = useAuth();
const navigate = useNavigate();
const [activeTab, setActiveTab] = useState("Profile");

const isOwnProfile = !userId || (currentUser?.id && userId === String(currentUser.id));

const { user, loading, error } = useProfile(userId);

const { favorites: watchlist, loading: watchlistLoading, error: watchlistError } = useFavorites(
  isOwnProfile ? user?.id : null,
  1
);

const { favorites: rawFavorites, loading: favoritesLoading, error: favoritesError } = useFavorites(user?.id, 2);
const { reviews, loading: reviewsLoading, error: reviewsError } = useUserReviews(user?.id);
const userGroupsData = useUserGroups(user?.id);
const userGroups = userGroupsData?.userGroups || [];
const groupsLoading = userGroupsData?.loading;
const groupsError = userGroupsData?.error;


  useEffect(() => {
    if (!userId && !isLoggedIn) {
      navigate("/login");
    }
  }, [userId, isLoggedIn, navigate]);

  if (loading) return <div className="profile-loading">Loading profile...</div>
  if (error) {
    console.error("Profile error:", error)
    return (
      <div className="profile-error">
        <h3>Error loading profile</h3>
        <p>{error.message || "Unknown error occurred"}</p>
        <p style={{ fontSize: "0.9em", color: "#666" }}>
          {userId ? `Tried to load user ID: ${userId}` : "Tried to load own profile"}
        </p>
      </div>
    )
  }
  if (!user) return <div className="profile-error">Profile not found.</div>

  // ✅ Inject isWatchlist into each favorite
  const watchlistIds = new Set(watchlist.map((m) => m.tmdb_id))
  const favorites = rawFavorites.map((fav) => ({
    ...fav,
    isWatchlist: watchlistIds.has(fav.tmdb_id),
  }))

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
              <span className="stat-number">{user.total_likes ?? "0"}</span>
              <span className="stat-label">LIKES</span>
            </div>
            <div>
              <span className="stat-number">
                {user.average_rating !== null ? Number(user.average_rating).toFixed(1) : "No reviews"}
              </span>
              <span className="stat-label">AVG RATING</span>
            </div>
            <div>
              <span className="stat-number">{user.aura ?? "0"}</span>
              <span className="stat-label">AURA</span>
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
            <div className="user-bio">
              <span className="section-title">BIO</span>
              <div className="user-bio-content">
                {user.user_bio ? (
                  <p>{user.user_bio}</p>
                ) : (
                  <p className="text-gray-400 italic">No bio provided.</p>
                )}
              </div>
            </div>
            <SectionDivider />
            <div className="my-groups">
              <span className="section-title">MY GROUPS</span>
              <div className="my-groups-content">
                {groupsLoading && <p>Loading groups...</p>}
                {groupsError && <p>Error loading groups.</p>}
                {!groupsLoading && userGroups.length === 0 && <p>You are not a member of any groups yet.</p>}
                {!groupsLoading && userGroups.length > 0 && (
                  <div className="group-grid">
                    {userGroups.map((group) => (
                      <div key={group.id} className="group-card-wrapper">
                        <GroupCard group={group} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
              <SectionDivider />
              <div className="my-reviews reviews-section">
                <span className="section-title">REVIEWS</span>
                <div className="my-reviews-content">
                  {reviewsLoading && <p>Loading reviews...</p>}
                  {reviewsError && <p>Error loading reviews.</p>}
                  {!reviewsLoading && reviews.length === 0 && <p>No reviews yet.</p>}
                  {!reviewsLoading && reviews.length > 0 && (
                    <div className="review-grid">
                      {[...reviews]
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                        .slice(0, 2)
                        .map((review) => (
                          <ReviewCard
                            key={review.id}
                            review={review}
                            currentUserId={currentUser?.id}
                            onDeleted={(id) => console.log("Deleted review:", id)}
                            onUpdated={(updated) => console.log("Updated review:", updated)}
                            showMovieHeader={true}
                          />
                        ))}
                    </div>
                  )}
                </div>
              </div>
          </>
        )}
        {activeTab === "Activity" && (
          <div className="activity-tab">
            <span className="section-title">INTERACTION ACTIVITY</span>
            <div className="activity-content">
              <ul className="interaction-list">
                <li><b>Reviews Written:</b> {user.review_count}</li>
                <li><b>Likes Received:</b> {user.total_likes}</li>
                <li><b>Dislikes Received:</b> {user.total_dislikes}</li>
                <li><b>Aura Score:</b> {user.aura}</li>
                <li><b>Interpretation:</b> {getAuraLabel(user.aura)}</li>
              </ul>
            </div>
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
                <FavoriteGrid
                  favorites={favorites}
                  watchlist={watchlist}
                  type={2}
                  userId={user.id}
                  limit={8}
                />
              )}
            </div>
          </div>
        )}
          {activeTab === "Reviews" && (
            <>
              <div className="my-reviews reviews-section">
                <span className="section-title">{isOwnProfile ? "MY REVIEWS" : "REVIEWS"}</span>
                <div className="my-reviews-content">
                  {reviewsLoading && <p>Loading reviews...</p>}
                  {reviewsError && <p>Error loading reviews.</p>}
                  {!reviewsLoading && reviews.length === 0 && (
                    <p className="text-muted">No reviews yet.</p>
                  )}
                  {!reviewsLoading && reviews.length > 0 && (
                    <div className="review-grid">
                      {reviews.map((review) => (
                        <ReviewCard
                          key={review.id}
                          review={review}
                          currentUserId={currentUser?.id}
                          onDeleted={(id) => console.log("Deleted review:", id)}
                          onUpdated={(updated) => console.log("Updated review:", updated)}
                          showMovieHeader={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        {isOwnProfile && activeTab === "Watchlist" && (
          <div>
            <span className="section-title">MY WATCHLIST</span>
            <div className="watchlist-content">
              {watchlistLoading && <p>Loading watchlist...</p>}
              {watchlistError && <p>Error loading watchlist.</p>}
              {!watchlistLoading && watchlist.length === 0 && <p>No movies in your watchlist yet. 👁</p>}
              {!watchlistLoading && watchlist.length > 0 && (
                <FavoriteGrid
                  favorites={watchlist.map((movie) => ({
                    ...movie,
                    isFavorite: rawFavorites.some((fav) => fav.tmdb_id === movie.tmdb_id),
                  }))}
                  watchlist={watchlist}
                  type={1}
                  userId={user.id}
                  limit={null}
                />
              )}
            </div>
          </div>
        )}
        <SectionDivider />
      </div>
    </div>
  )
}
