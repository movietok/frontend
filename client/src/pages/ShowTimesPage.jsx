import { useState, useEffect } from "react"
import { fetchAreas, fetchSchedule } from "../services/api"

export default function ShowTimes() {
    // Tilat teatterialueille, valitulle alueelle, päivämäärälle ja näytöksille
    const [areas, setAreas] = useState([])
    const [selectedArea, setSelectedArea] = useState("")
    const [date, setDate] = useState("")
    const [shows, setShows] = useState([])

    // Haetaan teatterialueet kun komponentti latautuu
    useEffect(() => {
        fetchAreas().then(res => setAreas(res.data))
    }, [])

    // Hae-nappi hakee aikataulun valitulle alueelle ja päivälle
    const handleSearch = async () => {
        const res = await fetchSchedule(selectedArea, date)
        setShows(res.data)
    }

return (
    <div>
    <h2>Finnkino Show Times</h2>
    <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
        <option value="">Choose area</option>
        {areas.map(a => (
        <option key={a.id} value={a.id}>{a.name}</option>
        ))}
    </select>
    <input
        type="text"
         placeholder="Date (dd.mm.yyyy)"
        value={date}
        onChange={(e) => setDate(e.target.value)}
    />
    <button onClick={handleSearch}>Search</button>

    <ul>
        {shows.map((s, i) => (
        <li key={i}>
            🎬 {s.title} – {s.start} @ {s.theatre}
        </li>
        ))}
    </ul>
    </div>
    )
}
