import { useState, useEffect } from "react"
import { 
  fetchTheatreAreas, 
  fetchFinnkinoSchedule, 
  fetchFinnkinoScheduleWithProxy 
} from "../services/finnkinoApi"

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
    console.log('Getting schedule for:', { area, date, eventID, nrOfDays })
    
    setLoading(true)
    setError(null)
    
    try {
      let schedule = []
      
      // First try direct API call
      try {
        schedule = await fetchFinnkinoSchedule(area, date, eventID, nrOfDays)
        console.log('Direct API call successful:', schedule.length, 'shows')
      } catch (directError) {
        console.log('Direct API call failed, trying proxy:', directError.message)
        
        // If direct call fails (likely due to CORS), try with proxy
        try {
          schedule = await fetchFinnkinoScheduleWithProxy(area, date, eventID, nrOfDays)
          console.log('Proxy API call successful:', schedule.length, 'shows')
        } catch (proxyError) {
          console.error('Both direct and proxy calls failed:', proxyError.message)
          throw new Error(`Failed to fetch schedule: ${proxyError.message}`)
        }
      }
      
      setShows(Array.isArray(schedule) ? schedule : [])
      
    } catch (err) {
      console.error('Failed to get schedule:', err)
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