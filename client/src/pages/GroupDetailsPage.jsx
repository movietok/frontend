import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getGroupDetails, getUserGroupsAPI } from "../services/groups";
import { getGroupFavorites, removeFavorite } from "../services/favoriteService";
import { getGroupReviews } from "../services/reviews";
import GroupManagementBox from "../components/groups/GroupManagementBox";
import ReviewCard from "../components/ReviewCard";
import CopyLinkButton from "../components/CopyLinkButton";
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

  // Normalize API responses
  const extractArray = (payload, key) => {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload[key])) return payload[key];
    if (payload?.data && Array.isArray(payload.data)) return payload.data;
    if (payload?.data && Array.isArray(payload.data[key])) return payload.data[key];
    return [];
  };

  // Member-only data (favorites + reviews).
  // Accepts setter functions so caller can guard against stale updates.
  async function loadMemberData(groupId, setFavoritesFn, setReviewsFn) {
    // Favorites
    const favRaw = await getGroupFavorites(groupId);
    const favs = extractArray(favRaw, "favorites") || [];
    setFavoritesFn(favs);

    // Reviews (enrich from favorites if missing)
    const favIndex = new Map(favs.map((m) => [String(m.tmdb_id), m]));
    const revRaw = await getGroupReviews(groupId);
    let list = extractArray(revRaw, "reviews") || [];

    list = list.map((rev) => {
      const movieId = String(rev.movie_id ?? rev.movieId ?? "");
      const hasMovieMeta =
        (rev.movie_name ?? rev.movieName) ||
        (rev.poster_url ?? rev.posterUrl) ||
        (rev.release_year ?? rev.releaseYear);
      if (!movieId || hasMovieMeta) return rev;
      const match = favIndex.get(movieId);
      if (!match) return rev;
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

    setReviewsFn(list);
  }

  // Initial load: fetch group; if (or once) member, load member data.
  // Also hard-clear member-only arrays when switching groups to prevent carry-over.
  useEffect(() => {
    let cancelled = false;

    // Clear previous group's member-only data immediately
    setFavorites([]);
    setReviews([]);
    setLoading(true);

    async function fetchData() {
      try {
        const data = await getGroupDetails(id);
        if (cancelled) return;
        const g = data?.group ?? data;
        setGroup(g);

        const isMemberLike =
          g?.role === "member" ||
          g?.role === "moderator" ||
          g?.role === "owner" ||
          g?.is_member ||
          g?.is_owner ||
          (currentUserId != null && Number(currentUserId) === Number(g?.owner_id));

        if (isMemberLike) {
          await loadMemberData(
            id,
            (vals) => { if (!cancelled) setFavorites(vals); },
            (vals) => { if (!cancelled) setReviews(vals); }
          );
          return;
        }

        // Reconcile: backend didn't mark us as member, but we might be one.
        if (currentUserId) {
          try {
            const myGroups = await getUserGroupsAPI(currentUserId);
            if (cancelled) return;
            const inGroup =
              Array.isArray(myGroups) &&
              myGroups.some((x) => Number(x.id ?? x.gID ?? x.group_id) === Number(id));

            if (inGroup) {
              const patched = { ...g, is_member: true, role: g.role ?? "member" };
              setGroup(patched);
              await loadMemberData(
                id,
                (vals) => { if (!cancelled) setFavorites(vals); },
                (vals) => { if (!cancelled) setReviews(vals); }
              );
            } else {
              // Ensure we don't show previous group's data
              setFavorites([]);
              setReviews([]);
            }
          } catch {
            // ignore reconciliation errors
            if (!cancelled) {
              setFavorites([]);
              setReviews([]);
            }
          }
        } else {
          // Not logged in or no membership—ensure arrays are empty
          setFavorites([]);
          setReviews([]);
        }
      } catch (err) {
        if (!cancelled) console.error("Error loading group details:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [id, currentUserId]);

  // Refetch member data when role flips to member/mod/owner (e.g., after joining)
  useEffect(() => {
    if (!group) return;

    const becameMember =
      group.role === "member" ||
      group.role === "moderator" ||
      group.role === "owner" ||
      group.is_member === true ||
      group.is_owner === true;

    if (becameMember) {
      let cancelled = false;
      (async () => {
        try {
          await loadMemberData(
            id,
            (vals) => { if (!cancelled) setFavorites(vals); },
            (vals) => { if (!cancelled) setReviews(vals); }
          );
        } catch (e) {
          console.error("Error loading member data:", e);
        }
      })();
      return () => { cancelled = true; };
    } else {
      // If role flips away from member, clear member-only data
      setFavorites([]);
      setReviews([]);
    }
  }, [group?.role, group?.is_member, group?.is_owner, id]);

  const handleGroupUpdated = (updatedGroup) => {
    const g = updatedGroup?.group ?? updatedGroup;
    setGroup(g);

    // If not a member after update, clear member-only data
    const notMember =
      !(g?.role === "member" || g?.role === "moderator" || g?.role === "owner") &&
      !g?.is_member &&
      !g?.is_owner;

    if (notMember) {
      setFavorites([]);
      setReviews([]);
    }
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
    group?.role === "owner" ||
    group?.is_owner === true ||
    (currentUserId != null && Number(currentUserId) === Number(group?.owner_id));

  const isMember =
    group?.role === "member" ||
    group?.role === "moderator" ||
    group?.role === "owner" ||
    group?.is_member === true ||
    isOwner;

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
        <CopyLinkButton label="Copy Group Link" />
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
                  showMovieHeader={true}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Membership & Management (visible to any logged-in user) */}
      {Boolean(currentUserId) && (
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
