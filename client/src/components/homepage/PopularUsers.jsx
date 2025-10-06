import React from "react";
import { Link } from "react-router-dom";
import Carousel from "../Carousel";

function PopularUsers({ users }) {
  const truncateUsername = (name, maxLen = 16) => {
    if (!name) return "Unknown";
    return name.length > maxLen ? name.slice(0, maxLen) + "..." : name;
  };

  return (
    <section className="popular-users">
      <div className="section-header">
        <h2>Popular Users</h2>
        <p>Users with the most likes on their reviews</p>
      </div>
      <Carousel
        items={users}
        cardWidth={200}
        renderItem={(user) => (
          <Link to={`/profile/${user.id}`} className="user-card">
            <h3>{truncateUsername(user.username)}</h3>
            <p>{user.total_likes ?? user.likes ?? 0} likes</p>
          </Link>
        )}
      />
    </section>
  );
}

export default PopularUsers;
