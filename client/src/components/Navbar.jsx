import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import searchIcon from "../images/searchimage.png"
import movieTokLogo from "../images/movietoknbg.png"
import UniversalModal from "./Popups/UniversalModal"

import "../styles/navbar.css"

export default function Navbar() {
  const [query, setQuery] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const { isLoggedIn, logout, user } = useAuth()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/browse?q=${encodeURIComponent(query)}`)
      setQuery("")
    }
  }

  useEffect(() => {
    if (!menuOpen) return

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuOpen])

  const handleInputChange = (e) => setQuery(e.target.value)

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    logout()
    setShowLogoutModal(false)
    navigate("/")
  }

  const cancelLogout = () => {
    setShowLogoutModal(false)
  }

  return (
    <header className="navbar-header">
      <Link to="/homepage" className="navbar-logo-link">
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

        {isLoggedIn && (
          <button onClick={handleLogout} className="logout-button">Logout</button>
        )}
        
        <div className="navbar-menu-wrapper">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="burger-button"
            aria-expanded={menuOpen}
            aria-controls="navbar-menu"
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>

          {menuOpen && (
            <div className="burger-menu" ref={menuRef} id="navbar-menu">
              <div className="mobile-nav-links">
                <Link to="/homepage" className="navbar-link" onClick={() => setMenuOpen(false)}>Home</Link><br />
                <Link to="/schedule" className="navbar-link" onClick={() => setMenuOpen(false)}>Showtimes</Link><br />
                <Link to="/groups" className="navbar-link" onClick={() => setMenuOpen(false)}>Groups</Link><br />
                <Link to="/browse" className="navbar-link" onClick={() => setMenuOpen(false)}>Browse</Link><br />
                <br />
              </div>
              {isLoggedIn ? (
                <>
                  <Link to={`/profile/${user?.id || ""}`} className="navbar-link" onClick={() => setMenuOpen(false)}>Profile</Link><br />
                  <Link to="/settings" className="navbar-link" onClick={() => setMenuOpen(false)}>Settings</Link><br />
                  <Link to={`/favorites/${user?.id}`} className="navbar-link" onClick={() => setMenuOpen(false)}>Favorites</Link><br />
                  <Link to="/watchlist" className="navbar-link" onClick={() => setMenuOpen(false)}>Watchlist</Link><br />
                  <button type="button" className="navbar-link logout-menu-link" onClick={() => { setMenuOpen(false); handleLogout() }}>Logout</button>
                </>
              ) : (
                <Link to="/login" className="navbar-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
              )}
            </div>
          )}
        </div>
      </nav>

      <UniversalModal
        isOpen={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout?"
        onOk={confirmLogout}
        onCancel={cancelLogout}
      />
    </header>
  )
}
