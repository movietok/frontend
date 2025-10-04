import { useState } from "react"
import { Link } from "react-router-dom"
import { useFinnkinoShowTimes } from "../hooks/useFinnkinoShowTimes"
import { getCurrentDate } from "../helpers/dateUtils"
import "../styles/ShowTimes.css"

export default function ShowTimesPage() {
  const [selectedArea, setSelectedArea] = useState("")
  const [date, setDate] = useState(getCurrentDate())
  const { areas, shows, loading, error, getSchedule, clearError } = useFinnkinoShowTimes()

  const handleSearch = () => {
    console.log('Search clicked with:', { selectedArea, date })
    clearError() // Clear any previous errors
    
    if (selectedArea && date) {
      // Convert date format if needed (dd.mm.yyyy for Finnkino API)
      const formattedDate = formatDateForFinnkino(date)
      console.log('Formatted date for API:', formattedDate)
      getSchedule(selectedArea, formattedDate)
    } else {
      alert('Please select both area and date')
    }
  }

  // Convert dd.mm.yyyy to yyyy-mm-dd for HTML date input
  const dateToISO = (finnkinoDate) => {
    if (!finnkinoDate || !/^\d{2}\.\d{2}\.\d{4}$/.test(finnkinoDate)) {
      return ''
    }
    const [day, month, year] = finnkinoDate.split('.')
    return `${year}-${month}-${day}`
  }

  // Convert yyyy-mm-dd to dd.mm.yyyy for Finnkino API
  const isoToFinnkino = (isoDate) => {
    if (!isoDate) return getCurrentDate()
    const [year, month, day] = isoDate.split('-')
    return `${day}.${month}.${year}`
  }

  // Format date for Finnkino API (dd.mm.yyyy)
  const formatDateForFinnkino = (dateString) => {
    // If already in dd.mm.yyyy format, return as is
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
      console.log('Date already in correct format:', dateString)
      return dateString
    }
    
    // Parse and convert to dd.mm.yyyy
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString)
      return dateString // Return original if invalid
    }
    
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const formatted = `${day}.${month}.${year}`
    console.log('Converted date:', dateString, '→', formatted)
    return formatted
  }

  const uniqueShows = Array.isArray(shows)
    ? shows
        .filter((show, index, self) =>
          index === self.findIndex(s =>
            (s.originalTitle || s.title) === (show.originalTitle || show.title) &&
            s.start === show.start &&
            s.theatre === show.theatre
          )
        )
        .sort((a, b) => {
          // Finnkino API returns ISO format dates in 'start' field
          const dateA = new Date(a.start)
          const dateB = new Date(b.start)
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
            type="date"
            value={dateToISO(date)}
            onChange={(e) => setDate(isoToFinnkino(e.target.value))}
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

      {/* Error message */}
      {error && (
        <section className="error-section">
          <div className="error-message">
            <h3>⚠️ Error</h3>
            <p>{error}</p>
            <p><strong>Note:</strong> Direct API calls to Finnkino may be blocked by CORS policy. This is expected in browser environments.</p>
            <button onClick={clearError} className="clear-error-btn">
              Clear Error
            </button>
          </div>
        </section>
      )}

      <section className="showtimes-list">
        {uniqueShows.length === 0 && !loading && !error ? (
          <div className="empty-message">
            Choose area and date then press "Search Showtimes"
          </div>
        ) : (
          uniqueShows.map((show, index) => {
            const showDate = new Date(show.start)
            const timeText = !isNaN(showDate.getTime())
              ? showDate.toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" })
              : "Aika tuntematon"

            const ratingText =
              typeof show.rating === "string"
                ? show.rating
                : show.rating?.name || "Ei arvostelua"

            const itemContent = (
              <div className="showtime-item-content" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '1rem', width: '100%', alignItems: 'center' }}>
                {/* Movie Poster from TMDB or Finnkino */}
                {show.posterPath ? (
                  <img 
                    src={show.posterPath} 
                    alt={show.originalTitle || show.title}
                    className="movie-poster"
                    style={{ width: '80px', height: '120px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                ) : (
                  <div className="movie-poster-placeholder" style={{ width: '80px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333', borderRadius: '4px' }}>🎬</div>
                )}
                
                <div className="movie-info">
                  <h3 className="movie-title">
                    {show.originalTitle || show.title}
                    {show.tmdbId && <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '8px' }}>⭐ {show.voteAverage?.toFixed(1)}</span>}
                  </h3>
                  <p className="movie-details">
                    {show.presentationMethodAndLanguage || show.language || "Suomi"} • {ratingText}
                  </p>
                  {show.overview && (
                    <p className="movie-overview" style={{ fontSize: '0.85em', color: '#888', marginTop: '4px', maxWidth: '500px' }}>
                      {show.overview.length > 150 ? show.overview.substring(0, 150) + '...' : show.overview}
                    </p>
                  )}
                </div>
                <div className="showtime-details">
                  <p className="showtime-time">{timeText}</p>
                  <p className="showtime-theater">{show.theatre}</p>
                </div>
              </div>
            )

            return show.tmdbId ? (
              <Link 
                key={index} 
                to={`/movie/${show.tmdbId}`}
                className="showtime-item"
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                {itemContent}
              </Link>
            ) : (
              <div key={index} className="showtime-item">
                {itemContent}
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