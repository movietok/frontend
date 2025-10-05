import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGroupDetails } from "../services/groups";
import "../styles/GroupDetailsPage.css";
import GroupManagementBox from "../components/groups/GroupManagementBox";

function GroupDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  // derive current user id from JWT (no network)
  const currentUserId = useMemo(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const [, payload] = token.split(".");
      if (!payload) return null;
      const decoded = JSON.parse(atob(payload));
      return decoded?.id ?? null; // your backend signs { id, username, email }
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    getGroupDetails(id)
      .then((data) => {
        // be robust to either shape: {success, group} or just group
        const g = data?.group ?? data;
        setGroup(g);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleGroupUpdated = (updatedGroup) => {
    setGroup(updatedGroup?.group ?? updatedGroup);
  };

  const handleGroupDeleted = () => {
    navigate("/groups");
  };

  if (loading) return <p>Loading...</p>;
  if (!group) return <p>Group not found</p>;

  // Compute ownership: prefer backend flag if present, else compare owner_id to JWT id
  const isOwner =
    group?.is_owner === true ||
    (currentUserId != null &&
      Number(currentUserId) === Number(group?.owner_id));

  return (
    <div className={`group-details-page group-theme ${group.theme_class || ""}`}>
      {/* Top Section */}
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

      {/* Management Box (owner only) */}
      {isOwner && (
        <GroupManagementBox
          group={group}
          onGroupUpdated={handleGroupUpdated}
          onGroupDeleted={handleGroupDeleted}
        />
      )}

      {/* Activity */}
      <section className="reviews-section">
        <h2>Group Activity</h2>
        <div className="write-review-bubble">💬 Start a Discussion</div>
        <div className="review-card">
          <p>No posts yet. (slots reserved for DB data)</p>
        </div>
      </section>
    </div>
  );
}

export default GroupDetailsPage;
