import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { fetchMovies } from "../services/api"

export default function SearchResultsPage() {
    // Haetaan hakusana URL-parametreista (q)
    const [searchParams] = useSearchParams()
    const query = searchParams.get("q")
    const [movies, setMovies] = useState([])

    // Kun query muuttuu, haetaan elokuvat backendin kautta
    useEffect(() => {
        if (query) {
        fetchMovies({ title: query }).then(res => setMovies(res.data))
        }
    }, [query])

    // Jos query puuttuu, näytetään viesti
    if (!query) return <p>No search query provided.</p>

    return (
        <div>
        <h2>Search Results for "{query}"</h2>
        <ul>
            {movies.map((m) => (
            <li key={m.id}>{m.title} ({m.release_date})</li>
            ))}
        </ul>
        </div>
    )
}
