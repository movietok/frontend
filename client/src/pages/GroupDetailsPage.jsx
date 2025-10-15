import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getGroupDetails, getUserGroupsAPI } from "../services/groups";
import { getGroupFavorites, removeFavorite } from "../services/favoriteService";
import { getGroupReviews } from "../services/reviews";
import GroupManagementBox from "../components/groups/GroupManagementBox";
import ReviewCard from "../components/ReviewCard";
import CopyLinkButton from "../components/CopyLinkButton";
import fallbackImg from "../images/fallback.png"; 
import OnsitePopup from "../components/Popups/OnsitePopup";
import "../styles/GroupDetailsPage.css";

function GroupDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [isMemberCached, setIsMemberCached] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [showAllGenres, setShowAllGenres] = useState(false);


  // --- Pagination for Reviews ---
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  // Compute current page slice
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  const handleNextPage = () => {
    if (indexOfLastReview < reviews.length) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const [favPage, setFavPage] = useState(1);
const favoritesPerPage = 8;

const indexOfLastFav = favPage * favoritesPerPage;
const indexOfFirstFav = indexOfLastFav - favoritesPerPage;
const currentFavorites = favorites.slice(indexOfFirstFav, indexOfLastFav);

const handleNextFavPage = () => {
  if (indexOfLastFav < favorites.length) {
    setFavPage((prev) => prev + 1);
  }
};

const handlePrevFavPage = () => {
  if (favPage > 1) {
    setFavPage((prev) => prev - 1);
  }
};

  // Reset to first page when review count changes
  useEffect(() => {
    setCurrentPage(1);
  }, [reviews.length]);

  useEffect(() => {
  setFavPage(1);
}, [favorites.length]);


  console.log("Rendered group object:", group);

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

  // Member-only data (favorites + reviews)
  async function loadMemberData(groupId, setFavoritesFn, setReviewsFn) {
    const favRaw = await getGroupFavorites(groupId);
    const favs = extractArray(favRaw, "favorites") || [];
    setFavoritesFn(favs);

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

  // Initial load: fetch group
  useEffect(() => {
    let cancelled = false;
    /* setFavorites([]);
    setReviews([]); */
    setLoading(true);

    async function fetchData() {

      try {
        const data = await getGroupDetails(id);
        if (cancelled) return;
        const g = data?.group ?? data;
        console.log("[fetchData] raw group from API:", {
  id: g?.id,
  role: g?.role,
  is_member: g?.is_member,
  is_owner: g?.is_owner,
  owner_id: g?.owner_id,
});

        // Normalize membership flags from members[] if backend didn't include them
const normalized = (() => {
  const n = { ...g };
  if (currentUserId && Array.isArray(g?.members)) {
    const me = g.members.find((m) => Number(m.id) === Number(currentUserId));
    n.role = n.role ?? me?.role ?? null;
    n.is_member = n.is_member ?? Boolean(me);
    n.is_owner = n.is_owner ?? (Number(g.owner_id) === Number(currentUserId));
  } else {
    // still keep owner flag if possible
    n.is_owner = n.is_owner ?? (Number(g?.owner_id) === Number(currentUserId));
  }
  return n;
})();

setGroup(normalized);


        const isMemberLike =
  g?.role === "member" ||
  g?.role === "moderator" ||
  g?.role === "owner" ||
  g?.is_member ||
  g?.is_owner ||
  (currentUserId != null && Number(currentUserId) === Number(g?.owner_id));

if (isMemberLike) {
  setIsMemberCached(true);
  await loadMemberData(
    id,
    (vals) => { if (!cancelled) setFavorites(vals); },
    (vals) => { if (!cancelled) setReviews(vals); }
  );

  console.log("[render] membership flags:", {
  cached: isMemberCached,
  role: group?.role,
  is_member: group?.is_member,
  is_owner: group?.is_owner,
  computed_isMember: isMember,
});

  return;
}


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
              setFavorites([]);
              setReviews([]);
            }
          } catch {
            if (!cancelled) {
              setFavorites([]);
              setReviews([]);
            }
          }
        } else {
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

  // 🧠 Preserve membership cache between refetches or transient clears
useEffect(() => {
  if (
    group?.role === "member" ||
    group?.role === "moderator" ||
    group?.role === "owner" ||
    group?.is_member ||
    group?.is_owner
  ) {
    if (!isMemberCached) setIsMemberCached(true);
  }
}, [group]);

  // Refetch when role changes
  // Refetch or clear when membership changes
useEffect(() => {
  if (!group) return;

  const isMemberNow =
    group.role === "member" ||
    group.role === "moderator" ||
    group.role === "owner" ||
    group.is_member === true ||
    group.is_owner === true;

  if (isMemberNow) {
    // ✅ User is a member or higher — load data
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
    // 🚫 User left or got removed — fully clear data and membership cache
    setIsMemberCached(false);
    setFavorites([]);
    setReviews([]);
    setGroup((prev) => ({
      ...prev,
      is_member: false,
      role: "none",
    }));
  }
}, [group?.role, group?.is_member, group?.is_owner, id]);


 const handleGroupUpdated = async (updatedGroup) => {
  // Accept both { group: {...} } or plain group object
  const gRaw = updatedGroup?.group ?? updatedGroup ?? {};
  const roleStr = String(gRaw.role ?? "").toLowerCase();

  // Check if current user is removed / left / pending
  const removedFromMembersArray =
    Array.isArray(gRaw.members) &&
    currentUserId != null &&
    !gRaw.members.some((m) => Number(m.id) === Number(currentUserId));

  const leaving =
    gRaw.is_member === false ||
    roleStr === "none" ||
    roleStr === "pending" ||
    removedFromMembersArray;

  if (leaving) {
    // 🚨 Instantly clear membership and member-only data
    setIsMemberCached(false);
    setFavorites([]);
    setReviews([]);
    setGroup((prev) => ({
      ...prev,
      ...gRaw,
      is_member: false,
      role: "none",
    }));
    return; // stop here — don’t re-fetch
  }

  // ---------- Existing normal update logic ----------
  const normalizedImmediate = (() => {
    const n = { ...gRaw };
    if (currentUserId) {
      n.is_owner =
        n.is_owner ??
        (Number(n.owner_id) === Number(currentUserId)) ??
        false;
      n.is_member =
        n.is_member ??
        (Array.isArray(n.members)
          ? n.members.some((m) => Number(m.id) === Number(currentUserId))
          : true);
      n.role =
        n.role ??
        (Array.isArray(n.members)
          ? n.members.find((m) => Number(m.id) === Number(currentUserId))?.role
          : group?.role ?? "member");
    }
    return n;
  })();

  setGroup((prev) => ({
    ...prev,
    ...normalizedImmediate,
    genres: normalizedImmediate.genres ?? prev.genres,
    role: normalizedImmediate.role ?? prev.role,
    is_member: normalizedImmediate.is_member ?? prev.is_member,
    is_owner: normalizedImmediate.is_owner ?? prev.is_owner,
  }));

  setIsMemberCached(true);

  try {
    const refreshed = await getGroupDetails(id);
    const freshGroup = refreshed?.group ?? refreshed;

    const normalizedFresh = (() => {
      const n = { ...freshGroup };
      if (currentUserId && Array.isArray(freshGroup?.members)) {
        const me = freshGroup.members.find(
          (m) => Number(m.id) === Number(currentUserId)
        );
        n.role = n.role ?? me?.role ?? null;
        n.is_member = n.is_member ?? Boolean(me);
        n.is_owner =
          n.is_owner ?? Number(freshGroup.owner_id) === Number(currentUserId);
      } else {
        n.is_owner =
          n.is_owner ?? Number(freshGroup?.owner_id) === Number(currentUserId);
      }
      return n;
    })();

    setGroup((prev) => ({
      ...prev,
      ...normalizedFresh,
      role: normalizedFresh.role ?? prev.role,
      is_member: normalizedFresh.is_member ?? prev.is_member,
      is_owner: normalizedFresh.is_owner ?? prev.is_owner,
      genres: normalizedFresh.genres ?? prev.genres,
    }));
  } catch (err) {
    console.error("Failed to refresh group details after update:", err);
  }
};



  const handleGroupDeleted = () => {
    navigate("/groups");
  };

 // --- Group Favorite Removal (with OnsitePopup) ---
const [showRemovePopup, setShowRemovePopup] = useState(false);
const [targetFavorite, setTargetFavorite] = useState(null);

const confirmRemoveFavorite = (tmdb_id) => {
  setTargetFavorite(tmdb_id);
  setShowRemovePopup(true);
};

const handleConfirmRemove = async () => {
  if (!targetFavorite) return;
  setRemoving(true);
  try {
    await removeFavorite(targetFavorite, 3, id);
    setFavorites((prev) => prev.filter((m) => m.tmdb_id !== targetFavorite));
  } catch (err) {
    console.error("Error removing favorite:", err);
    alert("Failed to remove movie from favorites");
  } finally {
    setRemoving(false);
    setShowRemovePopup(false);
    setTargetFavorite(null);
  }
};


  if (loading) return <p>Loading...</p>;
  if (!group) return <p>Group not found</p>;

  const isOwner =
  group?.role === "owner" ||
  group?.is_owner === true ||
  (currentUserId != null && Number(currentUserId) === Number(group?.owner_id));

  // 🧠 Membership: cache always wins over temporary undefined states
const role = (group?.role || "").toLowerCase();
const isPending = role === "pending";

const isMember =
  !isPending && (
    isMemberCached ||
    role === "member" ||
    role === "moderator" ||
    role === "owner" ||
    group?.is_member === true ||
    group?.is_owner === true ||
    isOwner
  );

const canViewPrivateContent =
  isMember || isOwner || role === "moderator";

const themeMap = {
  1: "theme-blue",
  2: "theme-green",
  3: "theme-purple",
  4: "theme-orange",
};


  return (
    <div className={`group-details-page ${themeMap[group?.theme_id] || ""}`}>
      {/* Header */}
<div className="group-header">

<img
  src={group.poster_url || fallbackImg}
  alt={group.name}
  className="group-poster"
/>


  <div className="group-info">
    <div className="group-title-row">
      <h1 className="group-title">
        {group.name}
        <CopyLinkButton label="🔗" className="copylink-btn-inline" title="Copy Group Link" />
      </h1>
    </div>

    {group.genre_tags && (
      <p className="group-genres">{group.genre_tags.join(", ")}</p>
    )}

    <div className="facts-management-row">
      {/* Facts Section */}
<div className="facts-box">
  <h3>Facts</h3>
  <ul>
    <li>
      Owner:{" "}
      <Link to={`/profile/${group.owner_id}`} className="owner-link">
        {group.owner_name || "Unknown"}
      </Link>
    </li>

    <li>
      Members: <span>{group.member_count || 0}</span>
    </li>

    {group.created_at && (
      <li>Created: {new Date(group.created_at).toLocaleDateString("en-GB")}</li>
    )}

    {group.visibility && <li>Visibility: {group.visibility}</li>}

    {/* ✅ Genres block added here */}
    {group.genres?.length > 0 && (
  <li className="group-genres-list">
    Genres:
    <div className={`genre-tags ${showAllGenres ? "expanded" : ""}`}>
      {group.genres.map((g) => (
        <span key={g.genre_id} className="genre-tag">
          {g.genre_name}
        </span>
      ))}
    </div>
    {group.genres.length > 8 && (
      <button
        className="toggle-genres-btn"
        onClick={() => setShowAllGenres(!showAllGenres)}
      >
        {showAllGenres ? "Hide" : "Show all"}
      </button>
    )}
  </li>
)}
  </ul>
</div>

      {/* Management Box (if logged in) */}
      {Boolean(currentUserId) && (
  <div className="management-box-wrapper styled-management-box">
 
  <div className="management-buttons">
    <GroupManagementBox
      group={group}
      onGroupUpdated={handleGroupUpdated}
      onGroupDeleted={handleGroupDeleted}
    />
  </div>
</div>
)}

    </div>
  </div>
</div>

{/* About Section */}
<section className="about-section-wide">
  <h2 className="about-title">About this Group</h2>
  <p
    className={`about-text ${showFullAbout ? "expanded" : "collapsed"}`}
  >
    {group.description || "No description available."}
  </p>
  {group.description && group.description.length > 200 && (
    <button
      className="readmore-btn"
      onClick={() => setShowFullAbout(!showFullAbout)}
    >
      {showFullAbout ? "Read less" : "Read more"}
    </button>
  )}
</section>


      {/* Group Favorites & Reviews */}
{canViewPrivateContent ? (
  <>
    {/* Group Favorites */}
    <section className="favorites-section">
      {favorites.length === 0 ? (
        <p className="empty-text">No movies yet in favorites.</p>
      ) : (
        <div className="favorites-container">
          <h2 className="favorites-title">Group Favorites</h2>

          <div className="favorites-grid">
            {currentFavorites.map((movie) => (
              <div key={movie.tmdb_id} className="favorites-grid-card">
                <Link to={`/movie/${movie.tmdb_id}`} className="fav-card-link">
                  <div className="fav-card hover-reveal">
                    <img
                      src={movie.poster_url || "https://via.placeholder.com/150x225"}
                      alt={movie.original_title}
                    />
                    <div className="fav-info hover-title">
                      <p className="fav-title">{movie.original_title}</p>
                    </div>
                  </div>
                </Link>

                {isOwner && (
                  <button
                    className="remove-fav-btn"
                    onClick={() => confirmRemoveFavorite(movie.tmdb_id)}
                    disabled={removing}
                    title="Remove from favorites"
                  >
                    ✖
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="fav-pagination">
            <button
              className="pagination-btn"
              onClick={handlePrevFavPage}
              disabled={favPage === 1}
            >
              ← Prev
            </button>

            <button
              className="pagination-btn"
              onClick={handleNextFavPage}
              disabled={indexOfLastFav >= favorites.length}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </section>

    {/* Group Reviews / Activity */}
    <section className="reviews-section">
      <h2 className="reviews-title">Group Activity</h2>
      {reviews.length === 0 ? (
        <p className="empty-text">No reviews yet from group members.</p>
      ) : (
        <>
          <div className="reviews-list">
            {currentReviews.map((rev) => (
              <ReviewCard
                key={rev.id}
                review={rev}
                currentUserId={currentUserId}
                onDeleted={(rid) =>
                  setReviews((prev) => prev.filter((r) => r.id !== rid))
                }
                onUpdated={(updated) =>
                  setReviews((prev) =>
                    prev.map((r) =>
                      r.id === updated.id
                        ? {
                            ...r,
                            ...updated,
                            movie_id: r.movie_id ?? updated.movie_id,
                            movie_name: r.movie_name ?? updated.movie_name,
                            poster_url: r.poster_url ?? updated.poster_url,
                            release_year: r.release_year ?? updated.release_year,
                          }
                        : r
                    )
                  )
                }
                showMovieHeader={true}
              />
            ))}
          </div>

          <div className="review-pagination">
            <button
              className="pagination-btn"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              ← Prev
            </button>

            <button
              className="pagination-btn"
              onClick={handleNextPage}
              disabled={indexOfLastReview >= reviews.length}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </section>
  </>
) : (
  <p className="empty-text restricted">
    This group’s favorites and activity are visible to members only.
  </p>
)}

{showRemovePopup && (
  <OnsitePopup
    message="Remove this movie from group favorites?"
    type="confirm"
    onConfirm={handleConfirmRemove}
    onCancel={() => {
      setShowRemovePopup(false);
      setTargetFavorite(null);
    }}
  />
)}

</div>
);
}

export default GroupDetailsPage;
