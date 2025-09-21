import React from "react"
import { Link } from "react-router-dom"
import Carousel from "../Carousel"

function MostActiveUsers({ users }) {
  return (
    <section className="most-active-users">
      <div className="section-header">
        <h2>Most Active Users</h2>
        <p>Users with the highest number of reviews</p>
      </div>
      <Carousel
        items={users}
        cardWidth={200}
        renderItem={(user) => (
          <Link to={`/profile/${user.id}`} className="user-card">
            <h3>{user.username}</h3>
            <p>{user.reviews} reviews</p>
          </Link>
        )}
      />
    </section>
  )
}

export default MostActiveUsers
