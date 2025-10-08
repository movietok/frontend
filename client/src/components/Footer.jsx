import { Link } from "react-router-dom"
import "../styles/Footer.css"

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
        <Link to="/about" className="footer-link">About</Link>
        <Link to="/faq" className="footer-link">FAQ</Link>
        <a href="https://www.themoviedb.org/documentation/api" target="_blank" rel="noopener noreferrer" className="footer-link">TMDb API</a>
        <a href="https://www.finnkino.fi/xml" target="_blank" rel="noopener noreferrer" className="footer-link">Finnkino API</a>
        <Link to="/contact" className="footer-link">Contact</Link>
        <Link to="/terms" className="footer-link">Terms</Link>
      </div>

      <div className="footer-note">
        © MovieTok. Built by students at Oamk. Film data from TMDb & Finnkino. Made with ❤️ in Finland.
      </div>
    </footer>
  )
}
