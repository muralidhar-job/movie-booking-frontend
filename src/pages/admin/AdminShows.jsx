import React, { useState, useEffect } from 'react'
import { theatreAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function AdminShows() {
  const { user }           = useAuth()
  const theatreId          = user?.theatreId || 'demo-theatre-id'
  const [shows, setShows]  = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]    = useState({ movieId: '', screenId: '', showTime: '', showType: 'REGULAR', priceMultiplier: 1.0 })
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg]      = useState('')
  const [error, setError]  = useState('')

  useEffect(() => { loadShows() }, [])

  const loadShows = () => {
    setLoading(true)
    theatreAPI.getShows(theatreId)
      .then(r => setShows(r.data || []))
      .catch(() => setShows(MOCK_SHOWS))
      .finally(() => setLoading(false))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await theatreAPI.createShow(theatreId, form)
      setMsg('Show created successfully!')
      setShowForm(false)
      setForm({ movieId: '', screenId: '', showTime: '', showType: 'REGULAR', priceMultiplier: 1.0 })
      loadShows()
    } catch (err) {
      // Demo mode
      setMsg('Show created (demo mode)')
      setShowForm(false)
      setShows(prev => [{
        id: 'new-' + Date.now(),
        movieTitle: 'New Movie',
        showTime: form.showTime,
        showType: form.showType,
        totalSeats: 100,
        availableSeats: 100,
        active: true
      }, ...prev])
    } finally {
      setSubmitting(false)
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const handleDelete = async (showId) => {
    if (!window.confirm('Cancel this show?')) return
    try {
      await theatreAPI.deleteShow(theatreId, showId)
      loadShows()
    } catch {
      setShows(prev => prev.map(s => s.id === showId ? { ...s, active: false } : s))
    }
  }

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })
  const fmtTime = (dt) => dt ? new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '-'

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Manage Shows</h1>
          <p className="page-subtitle">Create and manage your theatre shows</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Show'}
        </button>
      </div>

      {msg   && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Create Show Form */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Create New Show</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Movie ID</label>
                <input className="form-input" placeholder="Movie UUID from movie-service"
                  value={form.movieId} onChange={set('movieId')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Screen ID</label>
                <input className="form-input" placeholder="Screen UUID from theatre-service"
                  value={form.screenId} onChange={set('screenId')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Show Date &amp; Time</label>
                <input type="datetime-local" className="form-input"
                  value={form.showTime} onChange={set('showTime')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Show Type</label>
                <select className="form-select" value={form.showType} onChange={set('showType')}>
                  {['REGULAR','IMAX','4DX','DOLBY'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price Multiplier</label>
                <input type="number" step="0.1" min="1" max="3" className="form-input"
                  value={form.priceMultiplier} onChange={set('priceMultiplier')} />
                <p style={{ fontSize: 11, color: '#555', marginTop: 4 }}>1.0 = base price, 1.5 = 50% more</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Show'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shows list */}
      {loading && <div className="spinner" />}

      {!loading && shows.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
          <p>No shows created yet. Create your first show above.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {shows.map(show => (
          <div key={show.id} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>{show.movieTitle || 'Movie'}</h3>
                  <span className="badge badge-blue">{show.showType || 'REGULAR'}</span>
                  <span className={`badge ${show.active !== false ? 'badge-green' : 'badge-red'}`}>
                    {show.active !== false ? 'Active' : 'Cancelled'}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#888' }}>{fmtTime(show.showTime)}</p>
                <p style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                  Seats: {show.availableSeats ?? '-'} available / {show.totalSeats ?? '-'} total
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {show.active !== false && (
                  <button className="btn btn-secondary btn-sm"
                    style={{ borderColor: '#e50914', color: '#e50914' }}
                    onClick={() => handleDelete(show.id)}>
                    Cancel Show
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const MOCK_SHOWS = [
  { id: 's1', movieTitle: 'Pushpa 2', showTime: new Date(Date.now() + 7200000).toISOString(), showType: 'IMAX',    totalSeats: 100, availableSeats: 42, active: true },
  { id: 's2', movieTitle: 'KGF 3',    showTime: new Date(Date.now() + 18000000).toISOString(), showType: 'REGULAR', totalSeats: 150, availableSeats: 98, active: true },
]
