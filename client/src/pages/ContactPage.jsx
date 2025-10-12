import "../styles/ContactPage.css"

export default function ContactPage() {
  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1 className="contact-title">Contact Us</h1>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin in
          faucibus nulla, non porttitor leo. Aenean laoreet, augue nec mollis
          congue, lorem ligula interdum lorem, nec tincidunt arcu nisl non justo.
        </p>

        <ul className="contact-list">
          <li>
            <strong>Lorem Department – Dolor</strong><br />
            <a href="mail" className="contact-link">lorem ipsum.com</a>
          </li>
          <li>
            <strong>Ipsum Division – Sit Amet</strong><br />
            <a href="mail" className="contact-link">ipsum dolor.com</a>
          </li>
        </ul>

        <p className="contact-footer">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit 🎬
        </p>
      </div>
    </div>
  )
}
