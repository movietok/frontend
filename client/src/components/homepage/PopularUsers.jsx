import React from "react"
import { Link } from "react-router-dom"
import Carousel from "../carousel"

function PopularUsers({ users }) {
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
            <h3>{user.username}</h3>
            <p>{user.likes} likes</p>
          </Link>
        )}
      />
    </section>
  )
}

export default PopularUsers
