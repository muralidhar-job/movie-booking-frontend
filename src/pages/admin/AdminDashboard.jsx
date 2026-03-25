import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { theatreAPI, bookingAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const { user }            = useAuth()
  const [shows, setShows]   = useState([])
  const [loading, setLoading] = useState(false)
  const theatreId = user?.theatreId || 'demo-theatre-id'

  useEffect(() => {
    setLoading(true)
    theatreAPI.getShows(theatreId)
      .then(r => setShows(r.data || []))
      .catch(() => setShows(MOCK_SHOWS))
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    totalShows:  shows.length,
    activeShows: shows.filter(s => s.active !== false).length,
    totalSeats:  shows.reduce((acc, s) => acc + (s.totalSeats || 0), 0),
    available:   shows.reduce((acc, s) => acc + (s.availableSeats || 0), 0),
  }

  const fmtTime = (dt) => dt ? new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '-'

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Manage your shows and seat inventory</p>
        </div>
        <Link to="/admin/shows" className="btn btn-primary">+ Create Show</Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Shows',   value: stats.totalShows,  color: '#3b82f6' },
          { label: 'Active Shows',  value: stats.activeShows, color: '#22c55e' },
          { label: 'Total Seats',   value: stats.totalSeats,  color: '#e50914' },
          { label: 'Available',     value: stats.available,   color: '#eab308' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Shows table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2a2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Shows</h2>
          <Link to="/admin/shows" style={{ fontSize: 13, color: '#e50914', textDecoration: 'none' }}>Manage →</Link>
        </div>

        {loading && <div className="spinner" />}

        {!loading && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                  {['Movie', 'Show Time', 'Type', 'Available Seats', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#888', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shows.map((show, i) => (
                  <tr key={show.id || i} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 500 }}>{show.movieTitle || 'Movie'}</td>
                    <td style={{ padding: '14px 16px', color: '#aaa' }}>{fmtTime(show.showTime)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-blue">{show.showType || 'REGULAR'}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ color: show.availableSeats > 20 ? '#22c55e' : '#e50914' }}>
                        {show.availableSeats ?? '-'} / {show.totalSeats ?? '-'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${show.active !== false ? 'badge-green' : 'badge-red'}`}>
                        {show.active !== false ? 'Active' : 'Cancelled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const MOCK_SHOWS = [
  { id: 's1', movieTitle: 'Pushpa 2',  showTime: new Date(Date.now() + 3600000*2).toISOString(), showType: 'IMAX',    totalSeats: 100, availableSeats: 42, active: true },
  { id: 's2', movieTitle: 'KGF 3',     showTime: new Date(Date.now() + 3600000*5).toISOString(), showType: 'REGULAR', totalSeats: 150, availableSeats: 98, active: true },
  { id: 's3', movieTitle: 'RRR 2',     showTime: new Date(Date.now() + 3600000*8).toISOString(), showType: 'DOLBY',   totalSeats: 120, availableSeats: 5,  active: true },
  { id: 's4', movieTitle: 'Jawan 2',   showTime: new Date(Date.now() - 3600000*2).toISOString(), showType: 'REGULAR', totalSeats: 200, availableSeats: 0,  active: false },
]
