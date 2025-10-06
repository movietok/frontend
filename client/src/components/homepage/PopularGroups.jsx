import React from "react";
import { Link } from "react-router-dom";
import Carousel from "../Carousel";

function PopularGroups({ groups }) {
  // ✂️ Helper to safely truncate long group names
  const truncateGroupName = (name, maxLen = 18) => {
    if (!name) return "Unnamed Group";
    return name.length > maxLen ? name.slice(0, maxLen) + "..." : name;
  };

  return (
    <section className="popular-groups">
      <div className="section-header">
        <h2>Most Popular Groups</h2>
        <p>Join the conversation and connect with movie fans</p>
      </div>

      <Carousel
        items={groups}
        cardWidth={220}
        renderItem={(group) => (
          <Link to={`/groups/${group.id}`} className="group-card">
            <h3>{truncateGroupName(group.name)}</h3>
            <p>{group.member_count ?? group.members ?? 0} members</p>
          </Link>
        )}
      />
    </section>
  );
}

export default PopularGroups;
