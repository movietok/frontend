import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { searchMovies } from "../services/api"
import "../styles/SearchResults.css"

export default function SearchResultsPage() {
    // Haetaan hakusana URL-parametreista (q)
    const [searchParams] = useSearchParams()
    const query = searchParams.get("q")
    const [searchResults, setSearchResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Kun query muuttuu, haetaan elokuvat backendin kautta
    useEffect(() => {
        if (query) {
            setLoading(true)
            setError(null)
            searchMovies(query)
                .then(data => {
                    setSearchResults(data)
                    setLoading(false)
                })
                .catch(err => {
                    setError(err.message || "Search failed")
                    setLoading(false)
                })
        }
    }, [query])

    // Jos query puuttuu, näytetään viesti
    if (!query) return (
        <div className="search-results-page">
            <h2>Search</h2>
            <p>No search query provided.</p>
        </div>
    )

    return (
        <div className="search-results-page">
            <h2>Search Results for "{query}"</h2>
            
            {loading && <p>Searching movies...</p>}
            
            {error && (
                <div className="error-message">
                    <p>Error: {error}</p>
                </div>
            )}
            
            {searchResults && !loading && (
                <div className="search-results">
                    <p className="results-info">
                        {searchResults.success ? 
                            `Found ${searchResults.count} movie(s) in ${searchResults.listType}` :
                            "Search failed"
                        }
                    </p>
                    
                    {searchResults.events && searchResults.events.length > 0 ? (
                        <div className="movies-grid">
                            {searchResults.events.map((movie) => (
                                <div key={movie.id} className="movie-card">
                                    <div className="movie-info">
                                        <h3 className="movie-title">{movie.title}</h3>
                                        {movie.originalTitle !== movie.title && (
                                            <p className="original-title">Original: {movie.originalTitle}</p>
                                        )}
                                        <div className="movie-details">
                                            <span className="year">{movie.productionYear}</span>
                                            {movie.lengthInMinutes && (
                                                <span className="duration"> • {movie.lengthInMinutes} min</span>
                                            )}
                                            {movie.genres && (
                                                <span className="genres"> • {movie.genres}</span>
                                            )}
                                        </div>
                                        
                                        {movie.synopsis && (
                                            <p className="synopsis">{movie.synopsis}</p>
                                        )}
                                        
                                        {movie.directors && movie.directors.Director && (
                                            <div className="directors">
                                                <strong>Directors: </strong>
                                                {movie.directors.Director.map((director, index) => (
                                                    <span key={index}>
                                                        {director.FirstName} {director.LastName}
                                                        {index < movie.directors.Director.length - 1 ? ", " : ""}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {movie.cast && movie.cast.Actor && movie.cast.Actor.length > 0 && (
                                            <div className="cast">
                                                <strong>Cast: </strong>
                                                {movie.cast.Actor.slice(0, 3).map((actor, index) => (
                                                    <span key={index}>
                                                        {actor.FirstName} {actor.LastName}
                                                        {index < Math.min(movie.cast.Actor.length, 3) - 1 ? ", " : ""}
                                                    </span>
                                                ))}
                                                {movie.cast.Actor.length > 3 && " ..."}
                                            </div>
                                        )}
                                        
                                        {movie.videos && movie.videos.length > 0 && (
                                            <div className="trailer">
                                                <a 
                                                    href={`https://www.youtube.com/watch?v=${movie.videos[0].location}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="trailer-link"
                                                >
                                                    🎬 Watch Trailer
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        searchResults.success && (
                            <p className="no-results">No movies found for "{query}"</p>
                        )
                    )}
                </div>
            )}
        </div>
    )
}
