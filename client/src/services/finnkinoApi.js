// Finnkino XML API service
// Direct API calls to Finnkino XML endpoints

const FINNKINO_BASE_URL = 'https://www.finnkino.fi/xml'

// Theatre areas list
const THEATRE_AREAS = [
  { id: '1029', name: 'Valitse alue/teatteri' },
  { id: '1014', name: 'Pääkaupunkiseutu (pl. Espoo)' },
  { id: '1012', name: 'Espoo: liput beta.finnkino.fi-sivustolta' },
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

// Get schedule for area and date
export const fetchFinnkinoSchedule = async (area = '', date = '', eventID = '', nrOfDays = 1) => {
  try {
    const url = new URL(`${FINNKINO_BASE_URL}/Schedule/`)
    
    if (area) {
      url.searchParams.append('area', area)
    }
    if (date) {
      url.searchParams.append('dt', date)
    }
    if (eventID) {
      url.searchParams.append('eventID', eventID)
    }
    if (nrOfDays) {
      url.searchParams.append('nrOfDays', nrOfDays.toString())
    }
    
    console.log('Fetching schedule from:', url.toString())
    
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
    console.log('XML Response:', xmlText.substring(0, 500) + '...')
    
    const xmlDoc = parseXML(xmlText)
    const schedule = parseScheduleXML(xmlDoc)
    
    console.log('Parsed schedule:', schedule.length, 'shows')
    return schedule
    
  } catch (error) {
    console.error('Error fetching Finnkino schedule:', error)
    throw error
  }
}

// Fallback function with CORS proxy (if direct call fails)
export const fetchFinnkinoScheduleWithProxy = async (area = '', date = '', eventID = '', nrOfDays = 1) => {
  try {
    // Use a public CORS proxy service
    const proxyUrl = 'https://api.allorigins.win/raw?url='
    const targetUrl = new URL(`${FINNKINO_BASE_URL}/Schedule/`)
    
    if (area) {
      targetUrl.searchParams.append('area', area)
    }
    if (date) {
      targetUrl.searchParams.append('dt', date)
    }
    if (eventID) {
      targetUrl.searchParams.append('eventID', eventID)
    }
    if (nrOfDays) {
      targetUrl.searchParams.append('nrOfDays', nrOfDays.toString())
    }
    
    const fullUrl = proxyUrl + encodeURIComponent(targetUrl.toString())
    console.log('Fetching schedule via proxy from:', fullUrl)
    
    const response = await fetch(fullUrl)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const xmlText = await response.text()
    const xmlDoc = parseXML(xmlText)
    const schedule = parseScheduleXML(xmlDoc)
    
    console.log('Parsed schedule (via proxy):', schedule.length, 'shows')
    return schedule
    
  } catch (error) {
    console.error('Error fetching Finnkino schedule via proxy:', error)
    throw error
  }
}