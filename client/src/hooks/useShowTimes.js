import { useState, useEffect } from "react"
import { fetchAreas, fetchSchedule } from "../services/api"

export const useShowTimes = () => {
    const [areas, setAreas] = useState([])
    const [shows, setShows] = useState([])
    const [loading, setLoading] = useState(false)

    const getAreas = async () => {
        try {
        const data = await fetchAreas()
        setAreas(Array.isArray(data) ? data : [])
        } catch {
        setAreas([])
        }
    }

    const getSchedule = async (area, date) => {
        setLoading(true)
        try {
        const data = await fetchSchedule(area, date)
        setShows(Array.isArray(data) ? data : [])
        } catch {
        setShows([])
        } finally {
        setLoading(false)
        }
    }

    useEffect(() => {
        getAreas()
    }, [])

    return { areas, shows, loading, getSchedule }
}
