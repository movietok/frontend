import "../styles/AboutPage.css"

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1 className="about-title">About MovieTok</h1>

        <p>
          MovieTok is a social platform for movie enthusiasts, created by students at Oulu University 
          of Applied Sciences. We bring together movie information and showtimes with community features 
          to create a space where Finnish movie fans can discover films and connect with fellow enthusiasts.
        </p>

        <p>
          By combining Finnkino theater showtimes with detailed movie information and social features, 
          MovieTok helps you stay up-to-date with current releases, find showtimes at your local 
          theaters, and share your movie experiences with others. Join discussions about the latest 
          releases or discover new films through our community's recommendations.
        </p>

        <ul className="about-list">
          <li><strong>Movie Information</strong> – Details, ratings, and cast information for films</li>
          <li><strong>Theater Showtimes</strong> – Current showtimes from Finnkino theaters</li>
        </ul>

        <h2 className="about-subtitle">The MovieTok Experience</h2>
        <p>
          Movies are better when shared with others. That's why we've created features that make it 
          easy to connect with other movie enthusiasts, organize viewing parties, and share your 
          thoughts about the films you love.
        </p>

        <ul className="about-list">
          <li><strong>Community Features</strong> – Join discussions about your favorite films</li>
          <li><strong>Group System</strong> – Create and join movie interest groups</li>
          <li><strong>Review System</strong> – Share your thoughts on films you've watched</li>
          <li><strong>Favorites</strong> – Keep track of movies you love</li>
        </ul>

        <p className="about-footer">
          MovieTok unites movie fans 🎬
        </p>
      </div>
    </div>
  )
}
