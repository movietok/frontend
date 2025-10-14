// Finnkino XML API service
// Direct API calls to Finnkino XML endpoints

const FINNKINO_BASE_URL = 'https://www.finnkino.fi/xml'

// Theatre areas list
const THEATRE_AREAS = [
  { id: '1029', name: 'Select Area/Ttheatre' },
  { id: '1014', name: 'Pääkaupunkiseutu (ex. Espoo)' },
  { id: '1002', name: 'Helsinki' },
  { id: '1045', name: 'Helsinki: ITIS' },
  { id: '1031', name: 'Helsinki: KINOPALATSI' },
  { id: '1032', name: 'Helsinki: MAXIM' },
  { id: '1033', name: 'Helsinki: TENNISPALATSI' },
  { id: '1013', name: 'Vantaa: FLAMINGO' },
  { id: '1015', name: 'Jyväskylä: FANTASIA' },
  { id: '1016', name: 'Kuopio: SCALA' },
  { id: '1017', name: 'Lahti: KUVAPALATSI' },
  { id: '1041', name: 'Lappeenranta: STRAND' },
  { id: '1018', name: 'Oulu: PLAZA' },
  { id: '1019', name: 'Pori: PROMENADI' },
  { id: '1021', name: 'Tampere' },
  { id: '1034', name: 'Tampere: CINE ATLAS' },
  { id: '1035', name: 'Tampere: PLEVNA' },
  { id: '1047', name: 'Turku ja Raisio' },
  { id: '1022', name: 'Turku: KINOPALATSI' },
  { id: '1046', name: 'Raisio: LUXE MYLLY' }
]

// Parse XML response to JavaScript object
const parseXML = (xmlText) => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
  
  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror')
  if (parserError) {
    throw new Error('XML parsing failed: ' + parserError.textContent)
  }
  
  return xmlDoc
}

// Convert XML schedule to JavaScript objects
const parseScheduleXML = (xmlDoc) => {
  const shows = []
  const showElements = xmlDoc.querySelectorAll('Show')
  
  showElements.forEach(show => {
    const showData = {
      id: show.querySelector('ID')?.textContent || '',
      eventId: show.querySelector('EventID')?.textContent || '', // Finnkino Event ID for TMDB matching
      title: show.querySelector('Title')?.textContent || '', // Finnish title fallback
      originalTitle: show.querySelector('OriginalTitle')?.textContent || '', // Primary title to use
      productionYear: show.querySelector('ProductionYear')?.textContent || '',
      lengthInMinutes: show.querySelector('LengthInMinutes')?.textContent || '',
      dtLocalRelease: show.querySelector('dtLocalRelease')?.textContent || '',
      rating: show.querySelector('Rating')?.textContent || '',
      ratingLabel: show.querySelector('RatingLabel')?.textContent || '',
      ratingImageUrl: show.querySelector('RatingImageUrl')?.textContent || '',
      eventType: show.querySelector('EventType')?.textContent || '',
      genres: show.querySelector('Genres')?.textContent || '',
      theatre: show.querySelector('Theatre')?.textContent || '',
      theatreAuditorium: show.querySelector('TheatreAuditorium')?.textContent || '',
      theatreAndAuditorium: show.querySelector('TheatreAndAuditorium')?.textContent || '',
      start: show.querySelector('dttmShowStart')?.textContent || '',
      end: show.querySelector('dttmShowEnd')?.textContent || '',
      saleStartTime: show.querySelector('dttmShowSaleStart')?.textContent || '',
      presentationMethod: show.querySelector('PresentationMethod')?.textContent || '',
      presentationMethodAndLanguage: show.querySelector('PresentationMethodAndLanguage')?.textContent || '',
      showUrl: show.querySelector('ShowURL')?.textContent || '',
      eventUrl: show.querySelector('EventURL')?.textContent || '',
      images: {
        eventSmallImageLandscape: show.querySelector('EventSmallImageLandscape')?.textContent || '',
        eventSmallImagePortrait: show.querySelector('EventSmallImagePortrait')?.textContent || '',
        eventMediumImageLandscape: show.querySelector('EventMediumImageLandscape')?.textContent || '',
        eventMediumImagePortrait: show.querySelector('EventMediumImagePortrait')?.textContent || '',
        eventLargeImageLandscape: show.querySelector('EventLargeImageLandscape')?.textContent || '',
        eventLargeImagePortrait: show.querySelector('EventLargeImagePortrait')?.textContent || ''
      }
    }
    shows.push(showData)
  })
  
  return shows
}

// Get theatre areas (static list)
export const fetchTheatreAreas = async () => {
  try {
    return THEATRE_AREAS
  } catch (error) {
    console.error('Error fetching theatre areas:', error)
    throw error
  }
}

// Get schedule dates for area
export const fetchScheduleDates = async (area = '') => {
  try {
    const url = new URL(`${FINNKINO_BASE_URL}/ScheduleDates/`)
    if (area) {
      url.searchParams.append('area', area)
    }
    
    console.log('Fetching schedule dates from:', url.toString())
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      mode: 'cors', // This will likely fail due to CORS
      headers: {
        'Accept': 'application/xml, text/xml'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const xmlText = await response.text()
    const xmlDoc = parseXML(xmlText)
    
    // Parse dates from XML
    const dates = []
    const dateElements = xmlDoc.querySelectorAll('dateTime')
    dateElements.forEach(dateElement => {
      dates.push(dateElement.textContent)
    })
    
    return dates
  } catch (error) {
    console.error('Error fetching schedule dates:', error)
    throw error
  }
}

// Get schedule for area and date - Direct from Finnkino (no proxy)
export const fetchFinnkinoSchedule = async (area = '', date = '', eventID = '', nrOfDays = 1) => {
  const url = new URL(`${FINNKINO_BASE_URL}/Schedule/`)
  
  if (area) {
    url.searchParams.append('area', area)
  }
  if (date) {
    // Validate date format (should be dd.mm.yyyy)
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
      console.warn('⚠️ Date format incorrect:', date, '(expected: dd.mm.yyyy)')
    }
    url.searchParams.append('dt', date)
  }
  if (eventID) {
    url.searchParams.append('eventID', eventID)
  }
  if (nrOfDays) {
    url.searchParams.append('nrOfDays', nrOfDays.toString())
  }
  
  console.log('🎬 Fetching Finnkino schedule from:', url.toString())
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Accept': 'application/xml, text/xml'
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  const xmlText = await response.text()
  const xmlDoc = parseXML(xmlText)
  const schedule = parseScheduleXML(xmlDoc)
  
  console.log('✅ Parsed schedule:', schedule.length, 'shows')
  return schedule
}

// Fetch Now Playing events from Finnkino
export const fetchNowPlayingEvents = async () => {
  const url = new URL(`${FINNKINO_BASE_URL}/Events/`)
  url.searchParams.append('listType', 'NowInTheatres')
  
  console.log('🎬 Fetching Now Playing events from:', url.toString())
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Accept': 'application/xml, text/xml'
    }
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  const xmlText = await response.text()
  const xmlDoc = parseXML(xmlText)
  
  // Parse events
  const events = []
  const eventElements = xmlDoc.querySelectorAll('Event')
  
  eventElements.forEach(event => {
    const eventData = {
      id: event.querySelector('ID')?.textContent || '',
      title: event.querySelector('Title')?.textContent || '',
      originalTitle: event.querySelector('OriginalTitle')?.textContent || '',
      productionYear: event.querySelector('ProductionYear')?.textContent || '',
      lengthInMinutes: event.querySelector('LengthInMinutes')?.textContent || '',
      dtLocalRelease: event.querySelector('dtLocalRelease')?.textContent || '',
      rating: event.querySelector('Rating')?.textContent || '',
      ratingLabel: event.querySelector('RatingLabel')?.textContent || '',
      genres: event.querySelector('Genres')?.textContent || '',
      images: {
        eventSmallImagePortrait: event.querySelector('EventSmallImagePortrait')?.textContent || '',
        eventMediumImagePortrait: event.querySelector('EventMediumImagePortrait')?.textContent || '',
        eventLargeImagePortrait: event.querySelector('EventLargeImagePortrait')?.textContent || ''
      }
    }
    events.push(eventData)
  })
  
  console.log('✅ Parsed events:', events.length, 'movies')
  return events
}

// Enrich Finnkino shows with TMDB data
export const enrichShowsWithTMDB = async (shows, searchMovieByTitleYear) => {
  const enrichedShows = []
  const tmdbCache = new Map()
  
  // Get unique movies (by originalTitle + year)
  const uniqueMovies = new Map()
  shows.forEach(show => {
    const key = `${show.originalTitle || show.title}_${show.productionYear}`
    if (!uniqueMovies.has(key)) {
      uniqueMovies.set(key, show)
    }
  })
  
  console.log(`🎬 Fetching TMDB data for ${uniqueMovies.size} unique movies...`)
  
  // Fetch TMDB data for unique movies
  for (const [key, show] of uniqueMovies) {
    const originalTitle = show.originalTitle || show.title
    const year = show.productionYear
    
    if (!originalTitle || !year) {
      tmdbCache.set(key, null)
      continue
    }
    
    try {
      const response = await searchMovieByTitleYear(originalTitle, year, show.id || show.eventId)
      if (response?.success && response.results?.length > 0) {
        const tmdbData = response.results[0]
        tmdbCache.set(key, tmdbData)
        console.log(`✅ ${originalTitle} (${year}) [f_id:${show.id || show.eventId}] → TMDB ID: ${tmdbData.id}`)
      } else {
        console.log(`⚠️ No TMDB match: ${originalTitle} (${year}) [f_id:${show.id || show.eventId}]`)
        tmdbCache.set(key, null)
      }
    } catch (error) {
      console.error(`❌ Error: ${originalTitle}:`, error.message)
      tmdbCache.set(key, null)
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  // Enrich all shows with cached TMDB data
  for (const show of shows) {
    const key = `${show.originalTitle || show.title}_${show.productionYear}`
    const tmdbData = tmdbCache.get(key)
    
    enrichedShows.push({
      ...show,
      tmdbData: tmdbData || null,
      tmdbId: tmdbData?.id || null,
      posterPath: tmdbData?.posterPath || show.images?.eventMediumImagePortrait || '',
      overview: tmdbData?.overview || '',
      voteAverage: tmdbData?.voteAverage || null
    })
  }
  
  console.log(`✅ Enriched ${enrichedShows.length} shows with TMDB data`)
  return enrichedShows
}