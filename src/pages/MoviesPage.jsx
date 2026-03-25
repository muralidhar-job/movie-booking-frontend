import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { movieAPI } from '../services/api'

const CITIES     = ['Bengaluru','Mumbai','Delhi','Hyderabad','Chennai','Pune','Kolkata']
const LANGUAGES  = ['Hindi','Telugu','Tamil','Kannada','Malayalam','English']
const GENRES     = ['Action','Drama','Comedy','Thriller','Romance','Horror','Sci-Fi']
const RATINGS    = ['U','U/A','A']

export default function MoviesPage() {
  const [movies, setMovies]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [filters, setFilters] = useState({ city: '', language: '', genre: '', page: 0, size: 20 })
  const navigate = useNavigate()

  const fetchMovies = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filters.city)     params.city     = filters.city
      if (filters.language) params.language = filters.language
      if (filters.genre)    params.genre    = filters.genre
      params.page = filters.page
      params.size = filters.size

      const res = await movieAPI.browse(params)
      // Handle both paginated and plain array responses
      const data = res.data
      setMovies(data.content || data || [])
    } catch (err) {
      // Show mock data if backend not running
      setMovies(MOCK_MOVIES)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMovies() }, [filters.page])

  const setFilter = (key) => (e) => setFilters({ ...filters, [key]: e.target.value, page: 0 })

  return (
    <div className="container" style={{ padding: '32px 20px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Now Showing</h1>
        <p className="page-subtitle">Browse movies across cities, languages and genres</p>
      </div>

      {/* Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 32,
        padding: '16px 20px',
        background: '#1a1a1a',
        borderRadius: 12,
        border: '1px solid #2a2a2a'
      }}>
        <div>
          <label className="form-label">City</label>
          <select className="form-select" value={filters.city} onChange={setFilter('city')}>
            <option value="">All Cities</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Language</label>
          <select className="form-select" value={filters.language} onChange={setFilter('language')}>
            <option value="">All Languages</option>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Genre</label>
          <select className="form-select" value={filters.genre} onChange={setFilter('genre')}>
            <option value="">All Genres</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button className="btn btn-primary btn-full" onClick={fetchMovies}>
            Search
          </button>
        </div>
      </div>

      {/* Results */}
      {loading && <div className="spinner" />}

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && movies.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>No movies found</p>
          <p style={{ fontSize: 14 }}>Try changing your filters</p>
        </div>
      )}

      <div className="grid-4">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} onSelect={() =>
            navigate(`/movies/${movie.id}/shows`)
          }/>
        ))}
      </div>
    </div>
  )
}

function MovieCard({ movie, onSelect }) {
  const ratingColor = { 'U': '#22c55e', 'U/A': '#eab308', 'A': '#e50914' }

  return (
    <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s' }}
      onClick={onSelect}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#e50914' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';  e.currentTarget.style.borderColor = '#2a2a2a' }}
    >
      {/* Poster */}
      <div style={{ height: 280, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {movie.posterUrl ? (
          <img src={movie.posterUrl} alt={movie.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 48, opacity: 0.3 }}>🎬</span>
        )}
        {movie.rating && (
          <span className="badge" style={{
            position: 'absolute', top: 10, right: 10,
            background: ratingColor[movie.rating] ? ratingColor[movie.rating] + '22' : '#33333388',
            color: ratingColor[movie.rating] || '#aaa',
            border: `1px solid ${ratingColor[movie.rating] || '#444'}`
          }}>
            {movie.rating}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {movie.title}
        </h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {movie.language && <span className="badge badge-blue">{movie.language}</span>}
          {movie.genre    && <span className="badge badge-yellow">{movie.genre}</span>}
        </div>
        {movie.durationMins && (
          <p style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
            {movie.durationMins} mins
          </p>
        )}
        <button className="btn btn-primary btn-full btn-sm">
          Book Tickets
        </button>
      </div>
    </div>
  )
}

// Mock data for when backend is not running
const MOCK_MOVIES = [
  { id: '1', title: 'Pushpa 2', language: 'Telugu', genre: 'Action', rating: 'U/A', durationMins: 180 },
  { id: '2', title: 'KGF Chapter 3', language: 'Kannada', genre: 'Action', rating: 'A', durationMins: 165 },
  { id: '3', title: 'RRR 2', language: 'Telugu', genre: 'Drama', rating: 'U/A', durationMins: 190 },
  { id: '4', title: 'Jawan 2', language: 'Hindi', genre: 'Action', rating: 'U/A', durationMins: 155 },
  { id: '5', title: 'Kalki 2', language: 'Telugu', genre: 'Sci-Fi', rating: 'U', durationMins: 170 },
  { id: '6', title: 'Singham Returns', language: 'Hindi', genre: 'Action', rating: 'U/A', durationMins: 148 },
  { id: '7', title: 'Leo 2', language: 'Tamil', genre: 'Thriller', rating: 'A', durationMins: 162 },
  { id: '8', title: 'Devara 2', language: 'Telugu', genre: 'Action', rating: 'U/A', durationMins: 158 },
]
