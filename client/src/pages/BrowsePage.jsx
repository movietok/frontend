import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getGenres, discoverMovies } from "../services/tmdb";
import { searchMovies } from "../services/api";
import MovieCard from "../components/MovieCard";
import GenreSelector from "../components/GenreSelector";
import "../styles/BrowsePage.css"; 

function BrowsePage() {
  const [searchParams] = useSearchParams();
  const [genres, setGenres] = useState([]);
  const [selectedGenresDraft, setSelectedGenresDraft] = useState([]);
  const [appliedGenres, setAppliedGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [sortBy, setSortBy] = useState('popularity.desc');
  
  const query = searchParams.get("q");

  // Hae hakutulokset kun query muuttuu
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setIsSearchMode(false);
        setSearchResults([]);
        return;
      }

      try {
        setLoading(true);
        setIsSearchMode(true);
        console.log("Searching for:", query);
        
        const results = await searchMovies(query);
        console.log("Search results:", results);
        
        // Tarkista onko results.results array vai results suoraan
        const movieList = results.results || results || [];
        setSearchResults(movieList);
      } catch (err) {
        console.error("Error searching movies:", err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  useEffect(() => {
    getGenres()
      .then((data) => {
        console.log("Genres data from API:", data); // Debug log
        const normalized = (data.genres || []).map((g) => ({
          id: String(g.id), // Korjattu: käytetään g.id eikä g.tmdb_id
          name: g.name,
        }));
        console.log("Normalized genres:", normalized); // Debug log
        setGenres(normalized);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Älä hae discover-elokuvia jos ollaan hakutilassa
    if (isSearchMode) {
      return;
    }
    
    setLoading(true);
    setMovies([]);
    console.log("Calling discoverMovies with:", { withGenres: appliedGenres, page, sortBy });
    discoverMovies({ withGenres: appliedGenres, page, sortBy })
      .then((data) => {
        setMovies(data?.results || []);
        setTotalPages(data?.totalPages || data?.total_pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [appliedGenres, page, isSearchMode, sortBy]);

  const toggleGenre = (genreId) => {
    console.log("toggleGenre called with:", genreId, "type:", typeof genreId);
    const idStr = String(genreId);
    console.log("idStr:", idStr);
    setSelectedGenresDraft((prev) => {
      console.log("Previous selected genres:", prev);
      const newSelection = prev.includes(idStr) ? prev.filter((id) => id !== idStr) : [...prev, idStr];
      console.log("New selected genres:", newSelection);
      return newSelection;
    });
  };

  const applySearch = () => {
    setPage(1);
    setAppliedGenres(selectedGenresDraft);
  };

  const clearFilters = () => {
    if (appliedGenres.length === 0) {
      setSelectedGenresDraft([]);
      return;
    }
    setPage(1);
    setSelectedGenresDraft([]);
    setAppliedGenres([]);
  };

  // Reset page when sorting changes
  const handleSortChange = (newSortBy) => {
    console.log("Sort changed to:", newSortBy);
    setPage(1);
    setSortBy(newSortBy);
  };

  // Sidebar + content 2-col layout, inline to beat globals
  const layoutStyle = {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    columnGap: "3rem",
    alignItems: "start",
  };
  const sidebarStyle = {
    position: "sticky",
    top: "96px", 
    width: "260px",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div style={layoutStyle}>
        {/* Sidebar - näkyy aina */}
        <aside style={sidebarStyle}>
            <GenreSelector
              genres={genres}
              selectedGenres={selectedGenresDraft}
              onToggle={toggleGenre}
            />

            {/* Sort By selector - piilossa hakutilassa */}
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
                disabled={
                  selectedGenresDraft.length === 0 && appliedGenres.length === 0
                }
                className="w-full px-3 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
              >
                Clear Filters
              </button>
            </div>
          </aside>

        {/* Movies */}
        <main style={{ minWidth: 0 }}>
          {/* Näytä hakutulokset jos ollaan hakutilassa */}
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
              {/* Tarkista onko tuloksia */}
              {isSearchMode && searchResults.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                  <p>Ei tuloksia haulle "{query}"</p>
                </div>
              ) : (
                <div className="mt-movies-wrap">
                  {/* Näytä hakutulokset tai tavallisia elokuvia riippuen tilasta */}
                  {(isSearchMode ? searchResults : movies).slice(0, 16).map((movie) => (
                    <div className="mt-movie-tile" key={movie.id}>
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>
              )}

              {/* spacer */}
              <div style={{ height: 48 }} />
            </>
          )}

          {/* Pagination - piilossa hakutilassa */}
          {!isSearchMode && (
            <div className="flex justify-center gap-3 pb-8">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Prev
              </button>
              {/* removed: <span>{page} / {totalPages}</span>, can add back if wanted */}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default BrowsePage;
