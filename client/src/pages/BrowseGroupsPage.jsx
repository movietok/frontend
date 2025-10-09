import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom"; 
import { getGenres } from "../services/tmdb"
import { discoverGroups, searchGroups } from "../services/groups";
import GroupCard from "../components/GroupCard";
import GenreSelector from "../components/GenreSelector";
import "../styles/BrowseGroupsPage.css";

function BrowseGroupsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  const [selectedGenresDraft, setSelectedGenresDraft] = useState([]);
  const [appliedGenres, setAppliedGenres] = useState([]);
  const [groups, setGroups] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const query = searchParams.get("q");

  // 🔍 Search groups by query
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
        const results = await searchGroups(query);
        const groupList = results.groups || [];
        setSearchResults(groupList);
      } catch (err) {
        console.error("Error searching groups:", err);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  // 🎭 Fetch group genres
  useEffect(() => {
    getGenres()
      .then((data) => {
        const normalized = (data.genres || []).map((g) => ({
          id: String(g.id),
          name: g.name,
        }));
        setGenres(normalized);
      })
      .catch(console.error);
  }, []);

  // 📡 Fetch groups by genres
 useEffect(() => {
  if (isSearchMode) return;

  setLoading(true);
  setGroups([]);
  discoverGroups({ withGenres: appliedGenres, page })
    .then((data) => {
      if (data && Array.isArray(data.groups)) {
        data.groups.forEach((g) =>
          console.log(`Group: ${g.name}, Members: ${g.member_count}`)
        );
      }

      setGroups(data.groups || []);
      setTotalPages(1); // keep simple for now
    })
    .catch((err) => {
      console.error("Error fetching groups:", err);
    })
    .finally(() => setLoading(false));
}, [appliedGenres, page, isSearchMode]);


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

  // Sidebar + content layout
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

          <div className="space-y-2" style={{ marginTop: "20px" }}>
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

{/* Separated Create Group section */}
<div className="create-group-section">
  <button
    onClick={() => navigate("/groups/create")}
    className="create-group-btn"
  >
    + Create Group
  </button>
</div>

        </aside>

        {/* Groups */}
        <main style={{ minWidth: 0 }}>
          {isSearchMode && (
            <div style={{ marginBottom: "2rem" }}>
              <h2
                style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#333" }}
              >
                Results for: "{query}" ({searchResults.length} found)
              </h2>
            </div>
          )}

          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {isSearchMode && searchResults.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                  <p>No results for "{query}"</p>
                </div>
              ) : (
                <div className="mt-groups-wrap">
                  {(isSearchMode ? searchResults : groups).slice(0, 16).map((group) => (
                    <div className="mt-group-tile" key={group.id}>
                      <GroupCard group={group} />
                    </div>
                  ))}
                </div>
              )}

              {/* spacer */}
              <div style={{ height: 48 }} />
            </>
          )}

          {/* Pagination (optional later) */}
          {!isSearchMode && (
            <div className="flex justify-center gap-3 pb-8">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Prev
              </button>
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

export default BrowseGroupsPage;
