import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import searchIcon from "../images/searchimage.png"
import movieTokLogo from "../images/Movietoklogo.png"


export default function Navbar() {
    // Hakukentän tila
    const [query, setQuery] = useState("")
    // Navigointi React Routerin avulla
    const navigate = useNavigate()

    //Tyyli linkin tekstin väri constan
    const navLinkStyle = {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "500"
    }

    // Kun lomake lähetetään, ohjataan /search-sivulle
    const handleSearch = (e) => {
        e.preventDefault()
        if (query.trim()) {     // Lisätään query URL-parametreihin
        navigate(`/search?q=${encodeURIComponent(query)}`)
        setQuery("")     // Tyhjennetään hakukenttä
        }
    }

    return (
        <header style={{
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
        boxSizing: "border-box"  
        }}>
        <Link to="/" style={{ display: "flex", alignItems: "center" }}>
            <img
                src={movieTokLogo} 
                alt="MovieTok logo"
                style={{ height: "65px", marginRight: "1rem", paddingLeft: 100 }} 
            />
        </Link>

    <form onSubmit={handleSearch} style={{ position: "relative" }}>
  <div style={{
    display: "flex",
    alignItems: "center",
    transition: "width 0.3s ease",
    width: query ? "300px" : "150px", // levenee kirjoittaessa
    backgroundColor: "#fff",
    borderRadius: "4px",
    border: "1px solid #ccc",
    padding: "0.5rem",
    overflow: "hidden"
  }}>
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
        backgroundColor: "transparent"
      }}
    />
  </div>
</form>


        <nav style={{ display: "flex", gap: "1rem" }}>
            <Link to="/schedule" style={navLinkStyle}>Show Times</Link>
            <Link to="/groups" style={navLinkStyle}>Groups</Link>
            <Link to="/reviews" style={navLinkStyle}>Reviews</Link>
            <Link to="/login" style={navLinkStyle}>Login</Link>
        </nav>
        </header>
    )
}
