import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import searchIcon from "../images/searchimage.png"
import movieTokLogo from "../images/Movietoklogo.png"

export default function Navbar() {
  const [query, setQuery] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const { isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  const navLinkStyle = {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "500",
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
      setQuery("")
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        height: "65px",
        zIndex: 1000,
        backgroundColor: "#335355",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 2rem",
        boxSizing: "border-box",
      }}
    >
      <Link to="/homepage" style={{ display: "flex", alignItems: "center" }}>
        <img
          src={movieTokLogo}
          alt="MovieTok logo"
          style={{ height: "65px", marginRight: "1rem", paddingLeft: 100 }}
        />
      </Link>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            transition: "width 0.3s ease",
            width: query ? "300px" : "150px",
            backgroundColor: "#fff",
            borderRadius: "4px",
            border: "1px solid #ccc",
            padding: "0.5rem",
            overflow: "hidden",
          }}
        >
          <img
            src={searchIcon}
            alt="Search"
            style={{ width: "20px", marginRight: "8px" }}
          />
          <input
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "1rem",
              backgroundColor: "transparent",
            }}
          />
        </div>
      </form>

      {/* Nav links */}
      <nav style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Link to="/homepage" style={navLinkStyle}>
          Home
        </Link>       
        <Link to="/schedule" style={navLinkStyle}>
          Show Times
        </Link>
        <Link to="/groups" style={navLinkStyle}>
          Groups
        </Link>
        <Link to="/browse" style={navLinkStyle}>
          Browse
        </Link>

        {!isLoggedIn ? (
          <Link to="/login" style={navLinkStyle}>
            Login
          </Link>
        ) : (
          <>
            <button
              onClick={handleLogout}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Logout
            </button>

            {/* Burger Menu */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                ☰
              </button>
              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    background: "#222",
                    borderRadius: "4px",
                    padding: "0.5rem",
                    minWidth: "150px",
                  }}
                >
                  <Link to="/profile" style={navLinkStyle}>
                    Profile
                  </Link>
                  <br />
                  <Link to="/settings" style={navLinkStyle}>
                    Settings
                  </Link>
                  <br />
                  <Link to="/favorites" style={navLinkStyle}>
                    Favorites
                  </Link>
                  <br />
                  <Link to="/delete-account" style={{ ...navLinkStyle, color: "red" }}>
                    Delete Account
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </nav>
    </header>
  )
}