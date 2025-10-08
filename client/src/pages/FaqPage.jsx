import "../styles/FaqPage.css"

export default function FaqPage() {
  return (
    <div className="faq-page">
      <div className="faq-container">
        <h1 className="faq-title">Frequently Asked Questions</h1>

        <div className="faq-item">
          <h2 className="faq-question">What is MovieTok?</h2>
          <p className="faq-answer">
            MovieTok is a web application built for movie enthusiasts. It allows users to browse movies, check showtimes, write reviews, create groups, and manage personal favorites — all in one cinematic platform.
          </p>
        </div>

        <div className="faq-item">
          <h2 className="faq-question">Who built this app?</h2>
          <p className="faq-answer">
            This app was developed by a team of four students at Oulu University of Applied Sciences (Oamk) as part of a school project in Autumn 2025. The team includes Topias Perälä, Veikka Koskinen, Martin Negin, and Samu Lyhty.
          </p>
        </div>

        <div className="faq-item">
          <h2 className="faq-question">Do I need an account to use MovieTok?</h2>
          <p className="faq-answer">
            You can browse movies and showtimes without an account. However, features like reviews, profiles, favorites, and group creation require registration.
          </p>
        </div>

        <div className="faq-item">
          <h2 className="faq-question">Where does the movie data come from?</h2>
          <p className="faq-answer">
            MovieTok uses open data APIs including The Movie Database (TMDb) for movie details and Finnkino API for Finnish theater showtimes.
          </p>
        </div>

        <div className="faq-item">
          <h2 className="faq-question">Can I delete my account?</h2>
          <p className="faq-answer">
            Yes. You can permanently delete your account, which also removes your reviews, favorites, and group memberships.
          </p>
        </div>

        <div className="faq-item">
          <h2 className="faq-question">How did the team collaborate?</h2>
          <p className="faq-answer">
            The team used GitHub for version control and Discord for communication. Each member contributed across frontend, backend, and database design.
          </p>
        </div>

        <p className="faq-footer">Still curious? Reach out through the About page or explore the app to discover more 🎬</p>
      </div>
    </div>
  )
}
