import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { movieAPI } from '../services/api'

const CITIES = ['Bengaluru','Mumbai','Delhi','Hyderabad','Chennai','Pune','Kolkata']

export default function ShowsPage() {
  const { movieId }           = useParams()
  const [movie, setMovie]     = useState(null)
  const [shows, setShows]     = useState([])
  const [loading, setLoading] = useState(false)
  const [city, setCity]       = useState('Bengaluru')
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0])
  const navigate              = useNavigate()

  // Load movie details
  useEffect(() => {
    movieAPI.getById(movieId)
      .then(r => setMovie(r.data))
      .catch(() => setMovie({ title: 'Movie', language: 'Telugu', genre: 'Action' }))
  }, [movieId])

  // Load shows whenever city/date changes
  useEffect(() => { fetchShows() }, [movieId, city, date])

  const fetchShows = async () => {
    setLoading(true)
    try {
      const res = await movieAPI.getShows(movieId, city, date)
      setShows(res.data || [])
    } catch {
      setShows(MOCK_SHOWS)
    } finally {
      setLoading(false)
    }
  }

  const handleBookShow = (show) => {
    navigate(`/booking/${show.id}`, { state: { show, movie } })
  }

  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return ''
    const d = new Date(dateTimeStr)
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const isAfternoon = (dateTimeStr) => {
    if (!dateTimeStr) return false
    const h = new Date(dateTimeStr).getHours()
    return h >= 12 && h < 17
  }

  return (
    <div className="container" style={{ padding: '32px 20px' }}>

      {/* Movie header */}
      {movie && (
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/movies')}
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 20 }}>
            ←
          </button>
          <div>
            <h1 className="page-title">{movie.title}</h1>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {movie.language && <span className="badge badge-blue">{movie.language}</span>}
              {movie.genre    && <span className="badge badge-yellow">{movie.genre}</span>}
              {movie.rating   && <span className="badge badge-red">{movie.rating}</span>}
              {movie.durationMins && (
                <span style={{ fontSize: 13, color: '#666', alignSelf: 'center' }}>
                  {movie.durationMins} mins
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{
        display: 'flex', gap: 16, flexWrap: 'wrap',
        padding: '16px 20px', background: '#1a1a1a',
        borderRadius: 12, border: '1px solid #2a2a2a', marginBottom: 28
      }}>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label className="form-label">City</label>
          <select className="form-select" value={city} onChange={e => setCity(e.target.value)}>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label className="form-label">Date</label>
          <input type="date" className="form-input" value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setDate(e.target.value)} />
        </div>
      </div>

      {/* Afternoon discount banner */}
      <div style={{
        padding: '10px 16px', background: 'rgba(234,179,8,0.08)',
        border: '1px solid rgba(234,179,8,0.2)', borderRadius: 8,
        fontSize: 13, color: '#eab308', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8
      }}>
        <span>★</span>
        <span><strong>Afternoon Offer:</strong> 20% discount on shows between 12:00 PM – 5:00 PM. Use code <strong>AFTERNOON20</strong></span>
      </div>

      {loading && <div className="spinner" />}

      {!loading && shows.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>No shows available</p>
          <p style={{ fontSize: 14 }}>Try a different date or city</p>
        </div>
      )}

      {/* Shows grouped by theatre */}
      {!loading && shows.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {shows.map((show, i) => (
            <div key={show.id || i} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                    {show.theatreName || 'PVR Cinemas'}
                  </h3>
                  <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                    {show.city || city}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Show time button */}
                    <button
                      onClick={() => handleBookShow(show)}
                      style={{
                        padding: '8px 16px',
                        background: isAfternoon(show.showTime) ? 'rgba(234,179,8,0.15)' : 'rgba(229,9,20,0.1)',
                        border: `1px solid ${isAfternoon(show.showTime) ? '#eab308' : '#e50914'}`,
                        color: isAfternoon(show.showTime) ? '#eab308' : '#e50914',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 600,
                        transition: 'all 0.2s'
                      }}
                    >
                      {formatTime(show.showTime) || '02:30 PM'}
                      {isAfternoon(show.showTime) && (
                        <span style={{ fontSize: 10, marginLeft: 6, background: '#eab30822', padding: '1px 5px', borderRadius: 4 }}>
                          20% OFF
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  {show.showType && (
                    <span className="badge badge-blue" style={{ marginBottom: 8, display: 'inline-block' }}>
                      {show.showType}
                    </span>
                  )}
                  <p style={{ fontSize: 13, color: '#666' }}>
                    {show.availableSeats ?? '80'} seats left
                  </p>
                  {show.priceFrom && (
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f0', marginTop: 4 }}>
                      ₹{show.priceFrom}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const MOCK_SHOWS = [
  { id: 'show-1', theatreName: 'PVR Forum Mall', city: 'Bengaluru', showTime: new Date().toISOString().replace(/T.*/, 'T10:30:00'), showType: 'IMAX',    availableSeats: 45, priceFrom: 350 },
  { id: 'show-2', theatreName: 'PVR Forum Mall', city: 'Bengaluru', showTime: new Date().toISOString().replace(/T.*/, 'T14:00:00'), showType: 'REGULAR', availableSeats: 80, priceFrom: 200 },
  { id: 'show-3', theatreName: 'INOX Garuda',    city: 'Bengaluru', showTime: new Date().toISOString().replace(/T.*/, 'T15:30:00'), showType: 'DOLBY',   availableSeats: 60, priceFrom: 280 },
  { id: 'show-4', theatreName: 'Cinepolis',       city: 'Bengaluru', showTime: new Date().toISOString().replace(/T.*/, 'T18:00:00'), showType: 'REGULAR', availableSeats: 92, priceFrom: 180 },
  { id: 'show-5', theatreName: 'INOX Garuda',    city: 'Bengaluru', showTime: new Date().toISOString().replace(/T.*/, 'T21:00:00'), showType: '4DX',     availableSeats: 30, priceFrom: 450 },
]
