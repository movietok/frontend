import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import searchIcon from "../images/searchimage.png"
import movieTokLogo from "../images/Movietoklogo.png"
import ConfirmModal from "./Popups/ConfirmModal"
import UniversalModal from "./Popups/UniversalModal" 

import "../styles/navbar.css"

export default function Navbar() {
  const [query, setQuery] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const { isLoggedIn, logout, deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDeletedModal, setShowDeletedModal] = useState(false) 


  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/browse?q=${encodeURIComponent(query)}`)
      setQuery("")
    }
  }

  // Close burger menu when clicking outside
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
    logout()
    navigate("/")
  }

  const handleDelete = async () => {
    try {
      await deleteAccount()
      setIsModalOpen(false)
      setShowDeletedModal(true) // Show deleted modal popup

    } catch (err) {
      console.error(err)
      setIsModalOpen(false)
    }
  }

  const handleDeletedOk = () => {
    setShowDeletedModal(false)
    navigate("/signup", { replace: true })
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
                <div className="burger-menu" ref={menuRef}>
                  <Link to="/profile" className="navbar-link" onClick={() => setMenuOpen(false)}>Profile</Link><br />
                  <Link to="/settings" className="navbar-link" onClick={() => setMenuOpen(false)}>Settings</Link><br />
                  <Link to="/favorites" className="navbar-link" onClick={() => setMenuOpen(false)}>Favorites</Link><br />
                  <Link
                    to="/delete-account"
                    onClick={(e) => {
                      e.preventDefault()
                    }}
                    className="navbar-link delete-link"
                  >
                    Delete Account
                  </Link>

                  <ConfirmModal
                    isOpen={isModalOpen}
                    title="Delete Account?"
                    message="Are you sure you want to delete your account? This action cannot be undone."
                    onConfirm={handleDelete}
                    onCancel={() => setIsModalOpen(false)}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </nav>
      <UniversalModal
        isOpen={showDeletedModal}
        title="Account Deleted"
        message="Your account has been deleted successfully."
        onOk={handleDeletedOk}
      />
    </header>
  )
}