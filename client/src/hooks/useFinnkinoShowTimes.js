import { useState, useEffect } from "react"
import { 
  fetchTheatreAreas, 
  fetchFinnkinoSchedule,
  enrichShowsWithTMDB
} from "../services/finnkinoApi"
import { searchMovieByTitleYear } from "../services/tmdb"

export const useFinnkinoShowTimes = () => {
  const [areas, setAreas] = useState([])
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load theatre areas on mount
  useEffect(() => {
    const loadAreas = async () => {
      try {
        setError(null)
        const theatreAreas = await fetchTheatreAreas()
        setAreas(theatreAreas)
        console.log('Loaded theatre areas:', theatreAreas.length)
      } catch (err) {
        console.error('Failed to load theatre areas:', err)
        setError('Failed to load theatre areas')
        setAreas([])
      }
    }

    loadAreas()
  }, [])

  const getSchedule = async (area, date, eventID = '', nrOfDays = 1) => {
    console.log('🔍 Getting schedule for:', { area, date, eventID, nrOfDays })
    
    setLoading(true)
    setError(null)
    
    try {
      // Fetch Finnkino schedule directly from browser
      const schedule = await fetchFinnkinoSchedule(area, date, eventID, nrOfDays)
      console.log('✅ Finnkino schedule fetched:', schedule.length, 'shows')
      
      // Enrich with TMDB data
      console.log('🎬 Enriching with TMDB data...')
      const enrichedSchedule = await enrichShowsWithTMDB(schedule, searchMovieByTitleYear)
      
      setShows(Array.isArray(enrichedSchedule) ? enrichedSchedule : [])
      console.log('✅ Schedule ready with TMDB data')
      
    } catch (err) {
      console.error('❌ Failed to get schedule:', err)
      setError(err.message || 'Failed to fetch schedule')
      setShows([])
    } finally {
      setLoading(false)
    }
  }

  const clearShows = () => {
    setShows([])
    setError(null)
  }

  const clearError = () => {
    setError(null)
  }

  return { 
    areas, 
    shows, 
    loading, 
    error,
    getSchedule, 
    clearShows, 
    clearError 
  }
}