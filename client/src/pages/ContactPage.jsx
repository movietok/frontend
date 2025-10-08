import "../styles/ContactPage.css"

export default function ContactPage() {
  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1 className="contact-title">Contact Us</h1>

        <p>
          If you’re experiencing issues or have questions related to the MovieTok project, feel free to reach out to the appropriate team member:
        </p>

        <ul className="contact-list">
          <li>
            <strong>Frontend & UI Issues – Veikka Koskinen</strong><br />
            <a href="mailto:t3kove02@students.oamk.fi" className="contact-link">t3kove02@students.oamk.fi</a>
          </li>
          <li>
            <strong>Backend & Database Issues – Martin Negin</strong><br />
            <a href="mailto:t3nema00@students.oamk.fi" className="contact-link">t3nema00@students.oamk.fi</a>
          </li>
        </ul>

        <p className="contact-footer">
          We’re happy to help — whether it’s a bug, a feature request, or just movie talk 🎬
        </p>
      </div>
    </div>
  )
}
