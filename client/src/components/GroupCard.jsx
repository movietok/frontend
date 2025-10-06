import { Link } from "react-router-dom";
import "../styles/GroupCard.css";
import fallbackImg from "../images/fallback.png";

function GroupCard({ group }) {
  // ✅ Safe truncate helper
  const truncate = (text, len) =>
    text && text.length > len ? text.slice(0, len) + "..." : text;

  // ✅ Determine which image to use
  const imageSrc = group.poster_url ? group.poster_url : fallbackImg;

  // ✅ Fix member count duplication
  const memberCount = group.member_count ?? 0;

  return (
    <Link to={`/groups/${group.id}`} className="group-card-link">
      <div className="group-card">
        {/* Poster or fallback */}
        <img src={imageSrc} alt={group.name || "Group"} className="group-poster" />

        {/* Info section */}
        <div className="group-card-body">
          {/* ✅ Truncated title with ellipsis */}
          <h3 className="group-card-title" title={group.name}>
            {truncate(group.name, 24)}
          </h3>
          <p className="group-card-meta">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </p>
        </div>

        {/* ✅ Hover overlay with truncated description */}
        <div className="group-hover-overlay">
          <p>
            {group.description
              ? truncate(group.description, 140)
              : "No description available."}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default GroupCard;
