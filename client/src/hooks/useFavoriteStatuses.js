import { useState, useEffect, useRef } from "react";
import { checkFavoriteStatus } from "../services/favoriteService";

export const useFavoriteStatuses = (movieIds, user) => {
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(false);

  const lastMovieIdsRef = useRef("");
  const lastUserIdRef = useRef(null);
  const lastFetchTimeRef = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    //  Early exit if no user or empty movie list
    if (!user?.id || !movieIds || movieIds.length === 0) {
      setStatuses({});
      setLoading(false);
      return;
    }

    //  Build stable identity for comparison
    const currentMovieIdsString = [...movieIds].sort().join(",");
    const currentUserId = user.id;

    //  Skip duplicate fetch if nothing changed
    if (
      currentMovieIdsString === lastMovieIdsRef.current &&
      currentUserId === lastUserIdRef.current
    ) {
      console.log("🛑 STOPPING duplicate API call - same movieIds and user");
      return;
    }

    // Rate limit — prevent calls more frequent than 1s
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 1000) {
      console.log("🛑 RATE LIMITED - waiting 1 second between calls");
      return;
    }

    // Clear any existing debounce timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce 300ms before fetching
    timeoutRef.current = setTimeout(() => {
      lastMovieIdsRef.current = currentMovieIdsString;
      lastUserIdRef.current = currentUserId;
      lastFetchTimeRef.current = Date.now();

      let isMounted = true;

      const fetchStatuses = async () => {
        try {
          setLoading(true);
          console.log("✅ Fetching statuses for:", movieIds);
          const response = await checkFavoriteStatus(movieIds);

          if (!isMounted) return;

          // Convert array response → object map
          const statusMap = {};
          if (Array.isArray(response)) {
            response.forEach((item) => {
              statusMap[item.tmdb_id] = {
                isFavorite: item.is_favorite || false,
                isWatchlist: item.is_watchlist || false,
              };
            });
          }

          setStatuses(statusMap);
        } catch (error) {
          console.error("Error fetching favorite statuses:", error);
          setStatuses({});
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      fetchStatuses();

      return () => {
        isMounted = false;
      };
    }, 300);

    // Cleanup on dependency change or unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [movieIds.join(","), user?.id]); // ✅ key fix: prevents infinite re-render

  // Manual update function for child components
  const updateStatus = (movieId, isFavorite, isWatchlist) => {
    setStatuses((prev) => ({
      ...prev,
      [movieId]: { isFavorite, isWatchlist },
    }));
  };

  return { statuses, loading, updateStatus };
};
