import "../styles/ContactPage.css"

export default function ContactPage() {
  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1 className="contact-title">Contact Us</h1>

        <p>
          We're here to help! Whether you have questions about MovieTok, need technical support,
          or want to suggest new features, our team is ready to assist. Choose the most appropriate
          contact method below for the fastest response.
        </p>

        <ul className="contact-list">
          <li>
            <strong>Technical Support</strong><br />
            <span className="contact-link">support@movietok.com</span>
          </li>
          <li>
            <strong>Business & Partnerships</strong><br />
            <span className="contact-link">partnerships@movietok.com</span>
          </li>
          <li>
            <strong>Feature Suggestions</strong><br />
            <span className="contact-link">feedback@movietok.com</span>
          </li>
        </ul>

        <p className="contact-footer">
          Follow us on social media for the latest updates and movie discussions! 🎬
        </p>
      </div>
    </div>
  )
}
