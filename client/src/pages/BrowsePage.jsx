import { useEffect, useState } from "react";
import { getGenres, discoverMovies } from "../services/tmdb";
import MovieCard from "../components/MovieCard";
import GenreSelector from "../components/GenreSelector";
import "../styles/BrowsePage.css"; 

function BrowsePage() {
  const [genres, setGenres] = useState([]);
  const [selectedGenresDraft, setSelectedGenresDraft] = useState([]);
  const [appliedGenres, setAppliedGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getGenres()
      .then((data) => {
        const normalized = (data.genres || []).map((g) => ({
          id: String(g.tmdb_id),
          name: g.name,
        }));
        setGenres(normalized);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    setMovies([]);
    discoverMovies({ withGenres: appliedGenres, page })
      .then((data) => {
        setMovies(data?.results || []);
        setTotalPages(data?.totalPages || data?.total_pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [appliedGenres, page]);

  const toggleGenre = (genreId) => {
    const idStr = String(genreId);
    setSelectedGenresDraft((prev) =>
      prev.includes(idStr) ? prev.filter((id) => id !== idStr) : [...prev, idStr]
    );
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
        {/* Sidebar */}
        <aside style={sidebarStyle}>
          <GenreSelector
            genres={genres}
            selectedGenres={selectedGenresDraft}
            onToggle={toggleGenre}
          />

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
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {/* 4-across flex grid with gaps */}
              <div className="mt-movies-wrap">
                {movies.slice(0, 16).map((movie) => (
                  <div className="mt-movie-tile" key={movie.id}>
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>

              {/* spacer */}
              <div style={{ height: 48 }} />
            </>
          )}

          {/* Pagination */}
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
        </main>
      </div>
    </div>
  );
}

export default BrowsePage;
