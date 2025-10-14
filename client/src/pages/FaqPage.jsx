import "../styles/FaqPage.css"

export default function FaqPage() {
  return (
    <div className="faq-page">
      <div className="faq-container">
        <h1 className="faq-title">Frequently Asked Questions</h1>

        <div className="faq-item">
          <h2 className="faq-question">What is MovieTok?</h2>
          <p className="faq-answer">
            MovieTok is a social platform for movie enthusiasts in Finland. We combine movie information, 
            local showtimes, and social features to create a unique space where movie fans can discover, 
            discuss, and share their movie experiences. Think of it as your personal movie companion with 
            a built-in community!
          </p>
        </div>

        <div className="faq-item">
          <h2 className="faq-question">Do I need an account to use MovieTok?</h2>
          <p className="faq-answer">
            While you can browse movies and view showtimes without an account, creating a free account 
            unlocks all social features including creating and joining groups, maintaining favorites lists, 
            writing reviews, and participating in discussions. We recommend signing up to get the full 
            MovieTok experience!
          </p>
        </div>

        <div className="faq-item">
          <h2 className="faq-question">How accurate are the movie showtimes?</h2>
          <p className="faq-answer">
            Our showtimes are sourced directly from Finnkino's API and are updated in real-time. 
            However, we recommend double-checking the theater's website for last-minute changes, 
            especially for very popular releases or special screenings.
          </p>
        </div>

        <div className="faq-item">
          <h2 className="faq-question">Where does the movie information come from?</h2>
          <p className="faq-answer">
            We source our movie data from TMDB (The Movie Database), one of the most comprehensive 
            and up-to-date movie databases available. This includes movie details, cast information, 
            posters, and basic ratings. User reviews and ratings on MovieTok are from our own community.
          </p>
        </div>

        <div className="faq-item">
          <h2 className="faq-question">Can I manage my privacy settings?</h2>
          <p className="faq-answer">
            Yes! MovieTok gives you full control over your privacy. You can choose what information is visible 
            on your profile, manage your group memberships, and control who can see your reviews and favorites. 
            You can also deactivate your account at any time from your account settings.
          </p>
        </div>

        <div className="faq-item">
          <h2 className="faq-question">How do movie groups work?</h2>
          <p className="faq-answer">
            Groups are spaces where you can connect with other movie fans who share your interests. You can create 
            groups for specific genres, directors, or even organize movie nights. Each group has its own favorites 
            list, discussion space, and member management tools.
          </p>
        </div>

        <p className="faq-footer">
          Got more questions? Check out our support section or reach out to our team! 🎬
        </p>
      </div>
    </div>
  )
}