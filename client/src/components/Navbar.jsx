import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import searchIcon from "../images/searchimage.png"
import movieTokLogo from "../images/Movietoklogo.png"
import "../styles/navbar.css"

export default function Navbar() {
  const [query, setQuery] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const { isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
      setQuery("")
    }
  }

  const handleInputChange = (e) => {
    setQuery(e.target.value)
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <header className="navbar-header">
      <Link to="/homepage" style={{ display: "flex", alignItems: "center" }}>
        <img src={movieTokLogo} alt="MovieTok logo" className="navbar-logo" />
      </Link>

      <form onSubmit={handleSearch} className="search-form">
        <div className={`search-bar ${query ? "expanded" : "collapsed"}`}>
          <img src={searchIcon} alt="Search" className="search-icon" />
          <input
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={handleInputChange}
            className="search-input"
            autoComplete="off"
          />
        </div>
      </form>

      <nav className="navbar-nav">
        <Link to="/homepage" className="navbar-link">Home</Link>
        <Link to="/schedule" className="navbar-link">Showtimes</Link>
        <Link to="/groups" className="navbar-link">Groups</Link>
        <Link to="/browse" className="navbar-link">Browse</Link>

        {!isLoggedIn ? (
          <Link to="/login" className="navbar-link">Login</Link>
        ) : (
          <>
            <button onClick={handleLogout} className="logout-button">Logout</button>
            <div style={{ position: "relative" }}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="burger-button">☰</button>
              {menuOpen && (
                <div className="burger-menu">
                  <Link to="/profile" className="navbar-link">Profile</Link><br />
                  <Link to="/settings" className="navbar-link">Settings</Link><br />
                  <Link to="/favorites" className="navbar-link">Favorites</Link><br />
                  <Link to="/delete-account" className="navbar-link delete-link">Delete Account</Link>
                </div>
              )}
            </div>
          </>
        )}
      </nav>
    </header>
  )
}