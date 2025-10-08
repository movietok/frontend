import "../styles/TermsPage.css"

export default function TermsPage() {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1 className="terms-title">Terms of Service</h1>

        <section className="terms-section">
          <h2>1. Introduction</h2>
          <p>
            MovieTok is a student-built web application created as part of a school project at Oulu University of Applied Sciences (Oamk). By using this site, you agree to the following terms and conditions.
          </p>
        </section>

        <section className="terms-section">
          <h2>2. User Accounts</h2>
          <p>
            You may register for an account to access personalized features such as reviews, favorites, and group creation. You are responsible for maintaining the confidentiality of your login credentials.
          </p>
        </section>

        <section className="terms-section">
          <h2>3. Content and Reviews</h2>
          <p>
            Users may submit movie reviews and group content. All submitted content must be respectful and appropriate. We reserve the right to remove any content that violates these guidelines.
          </p>
        </section>

        <section className="terms-section">
          <h2>4. Data Sources</h2>
          <p>
            MovieTok uses open data APIs from The Movie Database (TMDb) and Finnkino. We do not claim ownership of any movie metadata or showtime information provided by these sources.
          </p>
        </section>

        <section className="terms-section">
          <h2>5. Account Deletion</h2>
          <p>
            You may delete your account at any time. This will permanently remove your reviews, favorites, and group memberships from the platform.
          </p>
        </section>

        <section className="terms-section">
          <h2>6. Limitations</h2>
          <p>
            This application is a non-commercial student project. While we strive for accuracy and reliability, we cannot guarantee uninterrupted service or complete data accuracy.
          </p>
        </section>

        <section className="terms-section">
          <h2>7. Contact</h2>
          <p>
            For questions or feedback, please visit our <a href="/contact" className="terms-link">Contact Page</a>.
          </p>
        </section>

        <p className="terms-footer">
          Last updated: October 2025
        </p>
      </div>
    </div>
  )
}
