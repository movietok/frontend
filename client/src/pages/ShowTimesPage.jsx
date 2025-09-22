import { useState } from "react"
import { useShowTimes } from "../hooks/useShowTimes"
import { getCurrentDate, parseFinnkinoDate } from "../helpers/dateUtils"
import "../styles/ShowTimes.css"

export default function ShowTimesPage() {
  const [selectedArea, setSelectedArea] = useState("")
  const [date, setDate] = useState(getCurrentDate())
  const { areas, shows, loading, getSchedule } = useShowTimes()

  const handleSearch = () => {
    if (selectedArea && date) {
      getSchedule(selectedArea, date)
    }
  }

  const uniqueShows = Array.isArray(shows)
    ? shows
        .filter((show, index, self) =>
          index === self.findIndex(s =>
            s.title === show.title &&
            s.start === show.start &&
            s.theatre === show.theatre
          )
        )
        .sort((a, b) => {
          const dateA = parseFinnkinoDate(a.start)
          const dateB = parseFinnkinoDate(b.start)
          return (dateA?.getTime() || 0) - (dateB?.getTime() || 0)
        })
    : []

  return (
    <div className="showtimes-container">
      <header className="showtimes-header">
        <h1>FinnKino Showtimes</h1>
        <h2>___________________________________________________________</h2>
      </header>

      <section className="filters-section">
        <div className="filter-group">
          <label htmlFor="area">Theather area</label>
          <select
            id="area"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
          >
            <option value="">Choose area...</option>
            {areas.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="text"
            placeholder="dd.mm.yyyy"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <button
          className="search-button"
          onClick={handleSearch}
          disabled={loading || !selectedArea || !date}
        >
          {loading ? "Loading..." : "Search Showtimes"}
        </button>
      </section>

      <section className="showtimes-list">
        {uniqueShows.length === 0 && !loading ? (
          <div className="empty-message">
            Choose area and date then press "Search Showtimes"
          </div>
        ) : (
          uniqueShows.map((show, index) => {
            const parsed = parseFinnkinoDate(show.start)
            const timeText = parsed
              ? parsed.toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" })
              : "Aika tuntematon"

            const ratingText =
              typeof show.rating === "string"
                ? show.rating
                : show.rating?.name || "Ei arvostelua"

            return (
              <div key={index} className="showtime-item">
                <div className="movie-poster-placeholder">🎬</div>
                <div className="movie-info">
                  <h3 className="movie-title">{show.title}</h3>
                  <p className="movie-details">
                    {show.language || "Suomi"} • {ratingText}
                  </p>
                </div>
                <div className="showtime-details">
                  <p className="showtime-time">{timeText}</p>
                  <p className="showtime-theater">{show.theatre}</p>
                </div>
              </div>
            )
          })
        )}

        {loading && (
          <div className="loading-message">Loading showtimes...</div>
        )}
      </section>

      <section className="quick-dates">
        <p className="quick-label">Quick selection:</p>
        <div className="quick-buttons">
          {[0, 1, 2, 3, 4].map(days => {
            const futureDate = new Date()
            futureDate.setDate(futureDate.getDate() + days)
            const day = String(futureDate.getDate()).padStart(2, "0")
            const month = String(futureDate.getMonth() + 1).padStart(2, "0")
            const year = futureDate.getFullYear()
            const dateStr = `${day}.${month}.${year}`

            return (
              <button
                key={days}
                onClick={() => {
                  setDate(dateStr)
                  setTimeout(handleSearch, 100)
                }}
                className={date === dateStr ? "active" : ""}
              >
                {days === 0 ? "Today" : days === 1 ? "Tomorrow" : dateStr}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}