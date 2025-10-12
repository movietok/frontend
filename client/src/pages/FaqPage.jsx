import "../styles/FaqPage.css"

export default function FaqPage() {
  return (
    <div className="faq-page">
      <div className="faq-container">
        <h1 className="faq-title">Frequently Asked Questions</h1>

        <div className="faq-item">
          <h2 className="faq-question">What is Lorem Ipsum?</h2>
          <p className="faq-answer">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. 
            Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. 
            Cras elementum ultrices diam.
          </p>
        </div>

        <div className="faq-item">
          <h2 className="faq-question">Who created this project?</h2>
          <p className="faq-answer">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. 
            Vestibulum tortor quam, feugiat vitae.
          </p>
        </div>

        <div className="faq-item">
          <h2 className="faq-question">Do I need an account?</h2>
          <p className="faq-answer">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Vivamus luctus urna sed urna ultricies ac tempor dui sagittis. 
            In condimentum facilisis porta.
          </p>
        </div>

        <div className="faq-item">
          <h2 className="faq-question">Where does the data come from?</h2>
          <p className="faq-answer">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. 
            Sed nisi. Nulla quis sem at nibh elementum imperdiet.
          </p>
        </div>

        <div className="faq-item">
          <h2 className="faq-question">Can I delete my account?</h2>
          <p className="faq-answer">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Maecenas malesuada elit lectus felis, malesuada ultricies. 
            Curabitur et ligula. Ut molestie a, ultricies porta urna.
          </p>
        </div>

        <div className="faq-item">
          <h2 className="faq-question">How does the team collaborate?</h2>
          <p className="faq-answer">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Aliquam erat volutpat. In hac habitasse platea dictumst. 
            Curabitur at lacus ac velit ornare lobortis.
          </p>
        </div>

        <p className="faq-footer">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit 🎬
        </p>
      </div>
    </div>
  )
}