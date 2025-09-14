import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

export default function Navbar() {
    // Hakukentän tila
    const [query, setQuery] = useState("")
    // Navigointi React Routerin avulla
    const navigate = useNavigate()

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
        padding: "1rem",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
        }}>
        <Link to="/" style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
            MovieTok
        </Link>

        <form onSubmit={handleSearch} style={{ flexGrow: 1, margin: "0 2rem" }}>
            <input
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc"
            }}
            />
        </form>

        <nav style={{ display: "flex", gap: "1rem" }}>
            <Link to="/schedule">Näytösajat</Link>
            <Link to="/login">Login</Link>
        </nav>
        </header>
    )
}
