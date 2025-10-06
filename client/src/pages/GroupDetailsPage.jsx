import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getGroupDetails } from "../services/groups";
import { getGroupFavorites, removeFavorite } from "../services/favoriteService";
import { getGroupReviews } from "../services/reviews";
import GroupManagementBox from "../components/groups/GroupManagementBox";
import ReviewCard from "../components/ReviewCard";
import "../styles/GroupDetailsPage.css";

function GroupDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);

  // Decode user ID from JWT
  const currentUserId = useMemo(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const [, payload] = token.split(".");
      if (!payload) return null;
      const decoded = JSON.parse(atob(payload));
      return decoded?.id ?? null;
    } catch {
      return null;
    }
  }, []);

  // Helpers to normalize API responses
  const extractArray = (payload, key) => {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload[key])) return payload[key];
    if (payload?.data && Array.isArray(payload.data)) return payload.data;
    if (payload?.data && Array.isArray(payload.data[key])) return payload.data[key];
    return [];
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // 1) Group details
        const data = await getGroupDetails(id);
        const g = data?.group ?? data;
        setGroup(g);

        const isMember =
          g?.is_member || g?.is_owner || currentUserId === g?.owner_id;

        if (!isMember) return;

        // 2) Favorites (movies the group has favorited)
        const favRaw = await getGroupFavorites(id);
        const favs =
          extractArray(favRaw, "favorites") ||
          []; // safety
        setFavorites(favs);

        // Build quick lookup by tmdb_id for enrichment
        const favIndex = new Map(
          favs.map((m) => [String(m.tmdb_id), m])
        );

        // 3) Reviews (by group members)
        const revRaw = await getGroupReviews(id);
        // Support: array OR {reviews} OR {data:{reviews}}
        let list =
          extractArray(revRaw, "reviews") ||
          [];

        // 4) Enrich reviews with movie info from favorites if missing
        list = list.map((rev) => {
          const movieId = String(rev.movie_id ?? rev.movieId ?? "");
          const hasMovieMeta =
            (rev.movie_name ?? rev.movieName) ||
            (rev.poster_url ?? rev.posterUrl) ||
            (rev.release_year ?? rev.releaseYear);

          if (!movieId || hasMovieMeta) return rev;

          const match = favIndex.get(movieId);
          if (!match) return rev;

          // Add both snake_case and camelCase so any consumer can read it
          return {
            ...rev,
            movie_name: rev.movie_name ?? rev.movieName ?? match.original_title,
            movieName: rev.movieName ?? rev.movie_name ?? match.original_title,
            poster_url: rev.poster_url ?? rev.posterUrl ?? match.poster_url,
            posterUrl: rev.posterUrl ?? rev.poster_url ?? match.poster_url,
            release_year: rev.release_year ?? rev.releaseYear ?? match.release_year,
            releaseYear: rev.releaseYear ?? rev.release_year ?? match.release_year,
          };
        });

        setReviews(list);
      } catch (err) {
        console.error("Error loading group details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, currentUserId]);

  const handleGroupUpdated = (updatedGroup) => {
    setGroup(updatedGroup?.group ?? updatedGroup);
  };

  const handleGroupDeleted = () => {
    navigate("/groups");
  };

  // Remove movie from favorites
  const handleRemoveFavorite = async (tmdb_id) => {
    if (!window.confirm("Remove this movie from group favorites?")) return;

    setRemoving(true);
    try {
      await removeFavorite(tmdb_id, 3, id);
      setFavorites((prev) => prev.filter((m) => m.tmdb_id !== tmdb_id));
    } catch (err) {
      console.error("Error removing favorite:", err);
      alert("Failed to remove movie from favorites");
    } finally {
      setRemoving(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!group) return <p>Group not found</p>;

  const isOwner =
    group?.is_owner === true ||
    (currentUserId != null && Number(currentUserId) === Number(group?.owner_id));

  const isMember = group?.is_member || isOwner;

  return (
    <div className={`group-details-page group-theme ${group.theme_class || ""}`}>
      {/* Header */}
      <div className="group-header">
        <img
          src={
            group.poster_url ||
            "https://via.placeholder.com/200x300?text=No+Image"
          }
          alt={group.name}
          className="group-poster"
        />
        <div className="group-info">
          <h1 className="group-title">{group.name}</h1>
          <p className="group-meta">
            Owner: <span>{group.owner_name || "Unknown"}</span> • Members:{" "}
            <span>{group.member_count || 0}</span>
          </p>
          {group.genre_tags && (
            <p className="group-genres">{group.genre_tags.join(", ")}</p>
          )}
        </div>
      </div>

      {/* Overview + Facts */}
      <div className="overview-facts">
        <div className="overview">
          <h2>About this Group</h2>
          <p>{group.description || "No description available."}</p>
        </div>
        <div className="facts-box">
          <h3>Facts</h3>
          <ul>
            {group.created_at && (
              <li>
                Created:{" "}
                {new Date(group.created_at).toLocaleDateString("en-GB")}
              </li>
            )}
            {group.visibility && <li>Visibility: {group.visibility}</li>}
          </ul>
        </div>
      </div>

      {/* Group Favorites */}
      {isMember && (
        <section className="favorites-section">
          <h2>Group Favorites</h2>
          {favorites.length === 0 ? (
            <p className="empty-text">No movies yet in favorites.</p>
          ) : (
            <div className="favorites-grid">
              {favorites.map((movie) => (
                <div key={movie.tmdb_id} className="fav-card-wrapper">
                  <Link
                    to={`/movie/${movie.tmdb_id}`}
                    className="fav-card-link"
                  >
                    <div className="fav-card">
                      <img
                        src={
                          movie.poster_url ||
                          "https://via.placeholder.com/150x225"
                        }
                        alt={movie.original_title}
                      />
                      <div className="fav-info">
                        <p className="fav-title">{movie.original_title}</p>
                        <span className="fav-year">{movie.release_year}</span>
                      </div>
                    </div>
                  </Link>

                  {/* Hover-visible remove button (owner only) */}
                  {isOwner && (
                    <button
                      className="remove-fav-btn"
                      onClick={() => handleRemoveFavorite(movie.tmdb_id)}
                      disabled={removing}
                      title="Remove from favorites"
                    >
                      ✖
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Group Reviews / Activity */}
      {isMember && (
        <section className="reviews-section">
          <h2>Group Activity</h2>
          {reviews.length === 0 ? (
            <p className="empty-text">No reviews yet from group members.</p>
          ) : (
            <div className="reviews-list">
              {reviews.map((rev) => (
                <ReviewCard
                  key={rev.id}
                  review={rev}
                  currentUserId={currentUserId}
                  onDeleted={(rid) =>
                    setReviews((prev) => prev.filter((r) => r.id !== rid))
                  }
                  onUpdated={(updated) =>
                    setReviews((prev) =>
                      prev.map((r) => (r.id === updated.id ? updated : r))
                    )
                  }
                  // Show movie indicator only on this page
                  showMovieHeader={true}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Owner-only Management */}
      {isOwner && (
        <GroupManagementBox
          group={group}
          onGroupUpdated={handleGroupUpdated}
          onGroupDeleted={handleGroupDeleted}
        />
      )}
    </div>
  );
}

export default GroupDetailsPage;
