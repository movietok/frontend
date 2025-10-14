import "../styles/TermsPage.css"

export default function TermsPage() {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1 className="terms-title">Terms of Service</h1>

        <section className="terms-section">
          <h2>Welcome to MovieTok</h2>
          <p>
            MovieTok is a student-built web application created at Oulu University of Applied Sciences (Oamk). 
            These terms outline your rights and responsibilities when using our platform. By accessing MovieTok, 
            you agree to these terms.
          </p>
        </section>

        <section className="terms-section">
          <h2>Using MovieTok</h2>
          <p>
            Our platform offers movie information, showtimes, and social features for movie enthusiasts. 
            While basic features are available to all visitors, creating an account gives you access to:
          </p>
          <ul>
            <li>Creating and joining movie groups</li>
            <li>Writing and sharing movie reviews</li>
            <li>Managing your favorites list</li>
            <li>Participating in community discussions</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>Your Content</h2>
          <p>
            When you post reviews, create groups, or contribute to discussions, you agree to:
          </p>
          <ul>
            <li>Share content that is appropriate and respectful</li>
            <li>Respect other users and their opinions</li>
            <li>Not post harmful, offensive, or illegal content</li>
            <li>Accept that we may remove inappropriate content</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>Data and Privacy</h2>
          <p>
            We use data from TMDB for movie information and Finnkino for showtimes. Your personal data is handled with care:
          </p>
          <ul>
            <li>You control what profile information is visible</li>
            <li>You can delete your account and data at any time</li>
            <li>We don't share your personal information with third parties</li>
            <li>Group memberships and favorites are only visible to other members</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>Important Disclaimers</h2>
          <p>
            As a student project, please note:
          </p>
          <ul>
            <li>This is a non-commercial educational platform</li>
            <li>Service availability may vary</li>
            <li>Movie data accuracy depends on our third-party sources</li>
            <li>Features may be updated or modified as part of development</li>
          </ul>
        </section>

        <p className="terms-footer">
          Have questions about these terms? Visit our Contact page for support. 🎬<br/>
          Last updated: October 2025
        </p>
      </div>
    </div>
  )
}
