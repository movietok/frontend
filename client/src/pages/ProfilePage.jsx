import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useProfile } from "../hooks/useProfile"
import { useUserReviews } from "../hooks/useUserReviews"
import "../styles/ProfilePage.css"

function SectionDivider() {
  return <div className="section-divider" />
}

export default function ProfilePage() {
  const { isLoggedIn } = useAuth()
  const { user, loading, error } = useProfile()
  const { reviews, loading: reviewsLoading, error: reviewsError } = useUserReviews(user?.id)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("Profile")

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login")
    }
  }, [isLoggedIn, navigate])

  if (loading) return <div className="profile-loading">Loading...</div>
  if (error) return <div className="profile-error">Error loading profile.</div>
  if (!user) return <div className="profile-error">Profile not found.</div>

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={"https://www.gravatar.com/avatar?d=mp"} alt="Avatar" />
        </div>
        <div className="profile-main">
          <div className="profile-username-row">
            <h2>{user.username}    
              <span className="profile-user-id">
                (ID: {user.id})
              </span>
            </h2>
          </div>
          
          <div className="profile-stats">
            <div>
              <span className="stat-number">0</span>
              <span className="stat-label">FILMS</span>
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
          className={activeTab === "Films" ? "active" : ""}
          onClick={() => setActiveTab("Films")}
        >
          Films
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
                        <b>Movie:</b> {review.movie_id} &nbsp;
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
        {activeTab === "Films" && (
          <div>
            <span className="section-title">FILMS</span>
            <div>Films content goes here.</div>
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
                      <b>Movie:</b> {review.movie_id} &nbsp;
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
            <div>Watchlist content goes here.</div>
          </div>
        )}
        <SectionDivider />
      </div>
    </div>
  )
}