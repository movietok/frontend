import "../styles/AboutPage.css"

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1 className="about-title">About This Project</h1>

        <p>
          This movie web application was developed as part of a school project at <strong>Oulu University of Applied Sciences (Oamk)</strong>, for the course <em>Web Application Project</em> in Autumn 2024, led by instructor <strong>Jouni Juntunen</strong>.
        </p>

        <p>
          The goal was to create a responsive platform for movie enthusiasts using modern technologies:
          <strong> React</strong> for the frontend, <strong>Node.js</strong> for the backend, and <strong>PostgreSQL</strong> as the database.
          The app integrates open data APIs including:
        </p>

        <ul className="about-list">
          <li><strong>The Movie Database (TMDb)</strong> – for movie metadata and posters</li>
          <li><strong>Finnkino API</strong> – for real-time showtimes across Finnish theaters</li>
        </ul>

        <h2 className="about-subtitle">Our Team</h2>
        <p>We were a group of four developers, each contributing across different areas of the stack:</p>

        <ul className="about-list">
          <li><strong>Topias Perälä</strong> – focused on frontend development</li>
          <li><strong>Veikka Koskinen</strong> – led frontend architecture and UI refinement</li>
          <li><strong>Martin Negin</strong> – worked across backend, frontend, and database design</li>
          <li><strong>Samu Lyhty</strong> – specialized in backend logic and database implementation</li>
        </ul>

        <p>
          We collaborated using <strong>GitHub</strong> for version control and <strong>Discord</strong> for communication and coordination.
          The project emphasized clean architecture, reusable components, and a feature-rich user experience.
        </p>

        <p className="about-footer">
          Built with teamwork, code, and a shared love for movies 🎬
        </p>
      </div>
    </div>
  )
}
