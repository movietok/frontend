// [imports remain unchanged]
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { getGenres, discoverMovies } from "../services/tmdb"
import { searchMovies } from "../services/api"
import MovieCard from "../components/MovieCard"
import GenreSelector from "../components/GenreSelector"
import "../styles/BrowsePage.css" 
import MovieActionBar from "../components/MovieActionBar"
import { useFavoriteStatuses } from "../hooks/useFavoriteStatuses"
import { useAuth } from "../context/AuthContext"

function BrowsePage() {
  const [searchParams] = useSearchParams()
  const [genres, setGenres] = useState([])
  const [selectedGenresDraft, setSelectedGenresDraft] = useState([])
  const [appliedGenres, setAppliedGenres] = useState([])
  const [movies, setMovies] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [sortBy, setSortBy] = useState('popularity.desc')
  const { user } = useAuth()
  
  const query = searchParams.get("q")

  const currentMovies = isSearchMode ? searchResults : movies
  const movieIds = currentMovies.slice(0, 16).map(movie => movie.id)
  const { statuses = {}, loading: statusLoading = false, updateStatus } = useFavoriteStatuses(movieIds, user)

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setIsSearchMode(false)
        setSearchResults([])
        return
      }

      try {
        setLoading(true)
        setIsSearchMode(true)
        const results = await searchMovies(query)
        const movieList = results.results || results || []
        setSearchResults(movieList)
      } catch (err) {
        console.error("Error searching movies:", err)
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchSearchResults()
  }, [query])

  useEffect(() => {
    getGenres()
      .then((data) => {
        const normalized = (data.genres || []).map((g) => ({
          id: String(g.id),
          name: g.name,
        }))
        setGenres(normalized)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (isSearchMode) return
    
    setLoading(true)
    setMovies([])
    discoverMovies({ withGenres: appliedGenres, page, sortBy })
      .then((data) => {
        setMovies(data?.results || [])
        setTotalPages(data?.totalPages || data?.total_pages || 1)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [appliedGenres, page, isSearchMode, sortBy])

  const toggleGenre = (genreId) => {
    const idStr = String(genreId)
    setSelectedGenresDraft((prev) =>
      prev.includes(idStr) ? prev.filter((id) => id !== idStr) : [...prev, idStr]
    )
  }

  const applySearch = () => {
    setPage(1)
    setAppliedGenres(selectedGenresDraft)
  }

  const clearFilters = () => {
    if (appliedGenres.length === 0) {
      setSelectedGenresDraft([])
      return
    }
    setPage(1)
    setSelectedGenresDraft([])
    setAppliedGenres([])
  }

  const handleSortChange = (newSortBy) => {
    setPage(1)
    setSortBy(newSortBy)
  }

  const layoutStyle = {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    columnGap: "3rem",
    alignItems: "start",
  }
  const sidebarStyle = {
    position: "sticky",
    top: "96px", 
    width: "260px",
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div style={layoutStyle}>
        <aside style={sidebarStyle}>
          <GenreSelector
            genres={genres}
            selectedGenres={selectedGenresDraft}
            onToggle={toggleGenre}
          />

          {!isSearchMode && (
            <div className="mt-6 space-y-2">
              <h3 className="text-lg font-semibold text-white">Sort By</h3>
              <select 
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="popularity.desc">Popularity (High to Low)</option>
                <option value="popularity.asc">Popularity (Low to High)</option>
                <option value="vote_average.desc">Rating (High to Low)</option>
                <option value="vote_average.asc">Rating (Low to High)</option>
                <option value="vote_count.desc">Vote Count (High to Low)</option>
                <option value="vote_count.asc">Vote Count (Low to High)</option>
                <option value="primary_release_date.desc">Release Date (Newest)</option>
                <option value="primary_release_date.asc">Release Date (Oldest)</option>
                <option value="title.asc">Title (A-Z)</option>
                <option value="title.desc">Title (Z-A)</option>
                <option value="revenue.desc">Revenue (High to Low)</option>
                <option value="revenue.asc">Revenue (Low to High)</option>
              </select>
            </div>
          )}

          <div className="mt-4 space-y-2">
            <button
              onClick={applySearch}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Search
            </button>
            <button
              onClick={clearFilters}
              disabled={selectedGenresDraft.length === 0 && appliedGenres.length === 0}
              className="w-full px-3 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
            >
              Clear Filters
            </button>
          </div>
        </aside>

        <main style={{ minWidth: 0 }}>
          {isSearchMode && (
            <div style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#333" }}>
                Hakutulokset haulle: "{query}" ({searchResults.length} tulosta)
              </h2>
            </div>
          )}

          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {isSearchMode && searchResults.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                  <p>Ei tuloksia haulle "{query}"</p>
                </div>
              ) : (
                <div className="mt-movies-wrap">
                  {currentMovies.slice(0, 16).map((movie) => {
                    const movieStatus = statuses[movie.id] || { isFavorite: false, isWatchlist: false }

                    return (
                      <div className="mt-movie-tile group" key={movie.id} style={{ position: "relative" }}>
                        <MovieCard movie={movie} />

                      {(!user || !statusLoading) && (
                        <div className="actions-hover-wrapper">
                          <MovieActionBar
                            tmdbId={movie.id}
                            type={2}
                            initialIsFavorite={movieStatus.isFavorite}
                            initialIsWatchlist={movieStatus.isWatchlist}
                            movieData={{
                              original_title: movie.original_title,
                              release_year: movie.release_date?.split("-")[0] || null,
                              poster_path: movie.poster_path
                            }}
                            onStatusChange={(tmdbId, isFavoriteOrWatchlist) => {
                              updateStatus(tmdbId, isFavoriteOrWatchlist.isFavorite, isFavoriteOrWatchlist.isWatchlist);
                            }}
                          />
                        </div>
                      )}

                      </div>
                    )
                  })}
                </div>
              )}

              <div style={{ height: 48 }} />

                            {!isSearchMode && (
                <div className="flex justify-center gap-3 pb-8">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="px-2 py-1 text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default BrowsePage
