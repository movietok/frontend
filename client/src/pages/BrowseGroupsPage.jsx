import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getGenres } from "../services/tmdb";
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

  // 📡 Fetch *all* groups once (no backend pagination)
  useEffect(() => {
    if (isSearchMode) return;

    setLoading(true);
    setGroups([]);

    discoverGroups({ withGenres: appliedGenres })
      .then((data) => {
        if (data && Array.isArray(data.groups)) {
          setGroups(data.groups);
          const total = Math.ceil(data.groups.length / 16);
          setTotalPages(total);
        } else {
          setGroups([]);
          setTotalPages(1);
        }
      })
      .catch((err) => {
        console.error("Error fetching groups:", err);
      })
      .finally(() => setLoading(false));
  }, [appliedGenres, isSearchMode]);

  const toggleGenre = (genreId) => {
    const idStr = String(genreId);
    setSelectedGenresDraft((prev) =>
      prev.includes(idStr)
        ? prev.filter((id) => id !== idStr)
        : [...prev, idStr]
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

  // 🔢 Pagination logic (frontend-only)
  const itemsPerPage = 16;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleGroups = (isSearchMode ? searchResults : groups).slice(
    startIndex,
    endIndex
  );

  // update total pages when search results change
  useEffect(() => {
    const source = isSearchMode ? searchResults : groups;
    setTotalPages(Math.max(1, Math.ceil(source.length / itemsPerPage)));
  }, [groups, searchResults, isSearchMode]);

  return (
    <div className="browse-groups-page">
      <div className="browse-groups-layout">
        {/* Sidebar */}
        <aside className="browse-groups-sidebar">
          <GenreSelector
            genres={genres}
            selectedGenres={selectedGenresDraft}
            onToggle={toggleGenre}
          />

          <div className="browse-groups-actions">
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

          {/* Create Group section */}
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
        <main className="browse-groups-content">
          {isSearchMode && (
            <div className="browse-groups-meta">
              <h2>
                Results for: "{query}" ({searchResults.length} found)
              </h2>
            </div>
          )}

          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {visibleGroups.length === 0 ? (
                <div className="browse-groups-empty">
                  <p>No results found.</p>
                </div>
              ) : (
                <div className="mt-groups-wrap">
                  {visibleGroups.map((group) => (
                    <div className="mt-group-tile" key={group.id}>
                      <GroupCard group={group} />
                    </div>
                  ))}
                </div>
              )}

              <div className="browse-groups-pagination-spacer" />

              {/* Pagination */}
              {totalPages > 1 && (
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default BrowseGroupsPage;
