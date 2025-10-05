import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useProfile } from "../hooks/useProfile"
import { useUserReviews } from "../hooks/useUserReviews"
import "../styles/ProfilePage.css"
import { useFavorites } from "../hooks/useFavorites"
import FavoriteGrid from "../components/FavoriteGrid"


function SectionDivider() {
  return <div className="section-divider" />
}

export default function ProfilePage() {
  const { userId } = useParams() // Get userId from URL
  const { isLoggedIn, user: currentUser } = useAuth()
  
  console.log('ProfilePage render - userId:', userId, 'currentUser?.id:', currentUser?.id, 'isLoggedIn:', isLoggedIn)
  
  const { user, loading, error } = useProfile(userId)
  const { favorites: watchlist, loading: watchlistLoading, error: watchlistError } = useFavorites(user?.id, 1)
  const { favorites, loading: favoritesLoading, error: favoritesError } = useFavorites(user?.id, 2)
  const { reviews, loading: reviewsLoading, error: reviewsError } = useUserReviews(user?.id)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("Profile")

  // Check if viewing own profile
  // If no userId in URL (/profile), it's own profile
  // If userId matches current user's id, it's also own profile
  const isOwnProfile = !userId || (currentUser?.id && userId === String(currentUser.id))


  if (loading) return <div className="profile-loading">Loading profile...</div>
  if (error) {
    console.error('Profile error:', error)
    return (
      <div className="profile-error">
        <h3>Error loading profile</h3>
        <p>{error.message || 'Unknown error occurred'}</p>
        <p style={{ fontSize: '0.9em', color: '#666' }}>
          {userId ? `Tried to load user ID: ${userId}` : 'Tried to load own profile'}
        </p>
      </div>
    )
  }
  if (!user) return <div className="profile-error">Profile not found.</div>

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={`https://ui-avatars.com/api/?name=${user.username}`} alt="Avatar" />
        </div>
        <div className="profile-main">
          <div className="profile-username-row">
            <h2>{user.username}    
              <span className="profile-user-id">
                (ID: {user.id})
              </span>
              {!isOwnProfile && (
                <span style={{ marginLeft: '10px', fontSize: '0.8em', color: '#888' }}>
                  (Viewing user's profile)
                </span>
              )}
            </h2>
          </div>
          
          <div className="profile-stats">
            <div>
              <span className="stat-number">
                {favoritesLoading ? "…" : favorites.length}
              </span>
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
        <button
          className={activeTab === "Profile" ? "active" : ""}
          onClick={() => setActiveTab("Profile")}
        >
          Profile
        </button>
        <button
          className={activeTab === "Activity" ? "active" : ""}
          onClick={() => setActiveTab("Activity")}
        >
          Activity
        </button>
        <button
          className={activeTab === "Favorites" ? "active" : ""}
          onClick={() => setActiveTab("Favorites")}
        >
          Favorites
        </button>
        <button
          className={activeTab === "Reviews" ? "active" : ""}
          onClick={() => setActiveTab("Reviews")}
        >
          Reviews
        </button>
        <button
          className={activeTab === "Watchlist" ? "active" : ""}
          onClick={() => setActiveTab("Watchlist")}
        >
          Watchlist
        </button>
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
                    {reviews.map(review => (
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
                <FavoriteGrid
                  favorites={[...favorites]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 4)}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === "Reviews" && (
          <div>
            <span className="section-title">MY REVIEWS</span>
            <div className="my-reviews-content">
              {reviewsLoading && <p>Loading reviews...</p>}
              {reviewsError && <p>Error loading reviews.</p>}
              {!reviewsLoading && reviews.length === 0 && <p>No reviews yet.</p>}
              {!reviewsLoading && reviews.length > 0 && (
                <ul>
                  {reviews.map(review => (
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
        {activeTab === "Watchlist" && (
          <div>
            <span className="section-title">WATCHLIST</span>
            <div className="watchlist-content">
              {watchlistLoading && <p>Loading watchlist...</p>}
              {watchlistError && <p>Error loading watchlist.</p>}
              {!watchlistLoading && watchlist.length === 0 && <p>No movies in your watchlist yet. 👁</p>}
              {!watchlistLoading && watchlist.length > 0 && (
                <FavoriteGrid
                  favorites={[...watchlist]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 4)}
                  type={1} // ✅ pass type=1 so FavoriteGrid knows it's watchlist
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