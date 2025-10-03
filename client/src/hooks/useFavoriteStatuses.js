import { useState, useEffect, useRef } from 'react'
import { checkFavoriteStatus } from '../services/favoriteService'

export const useFavoriteStatuses = (movieIds, user) => {
  const [statuses, setStatuses] = useState({})
  const [loading, setLoading] = useState(false)
  const lastMovieIdsRef = useRef('')
  const lastUserIdRef = useRef(null)
  const lastFetchTimeRef = useRef(0)
  const timeoutRef = useRef(null)

  useEffect(() => {
    // Early return if no conditions to fetch
    if (!user?.id || !movieIds || movieIds.length === 0) {
      setStatuses({})
      setLoading(false)
      return
    }

    // Prevent duplicate API calls - check if movieIds or userId actually changed
    const currentMovieIdsString = movieIds.sort().join(',')
    const currentUserId = user.id
    
    if (currentMovieIdsString === lastMovieIdsRef.current && currentUserId === lastUserIdRef.current) {
      console.log('🛑 STOPPING duplicate API call - same movieIds and user')
      return
    }
    
    // Rate limiting - prevent calls more frequent than 1 second
    const now = Date.now()
    if (now - lastFetchTimeRef.current < 1000) {
      console.log('🛑 RATE LIMITED - waiting 1 second between calls')
      return
    }
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Debounce - wait 300ms before making call
    timeoutRef.current = setTimeout(() => {
      lastMovieIdsRef.current = currentMovieIdsString
      lastUserIdRef.current = currentUserId
      lastFetchTimeRef.current = Date.now()
      
      let isMounted = true
      const fetchStatuses = async () => {
        try {
          setLoading(true)
          console.log('✅ Fetching statuses for:', movieIds)
          const response = await checkFavoriteStatus(movieIds)
          
          if (!isMounted) return
          
          // Convert array response to object for easier lookup
          // Expected response format: [{ movie_id: 123, is_favorite: true, is_watchlist: false }, ...]
          const statusMap = {}
          if (Array.isArray(response)) {
            response.forEach(item => {
              statusMap[item.movie_id] = {
                isFavorite: item.is_favorite || false,
                isWatchlist: item.is_watchlist || false
              }
            })
          }
          
          if (isMounted) {
            setStatuses(statusMap)
          }
        } catch (error) {
          console.error('Error fetching favorite statuses:', error)
          if (isMounted) {
            setStatuses({})
          }
        } finally {
          if (isMounted) {
            setLoading(false)
          }
        }
      }

      fetchStatuses()
    }, 300) // 300ms debounce
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [movieIds, user?.id]) // Let the ref handle duplicate prevention

  const updateStatus = (movieId, isFavorite, isWatchlist) => {
    setStatuses(prev => ({
      ...prev,
      [movieId]: { isFavorite, isWatchlist }
    }))
  }

  return { statuses, loading, updateStatus }
}