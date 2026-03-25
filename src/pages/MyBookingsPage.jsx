import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingAPI } from '../services/api'

const STATUS_BADGE = {
  CONFIRMED:        { cls: 'badge-green',  label: 'Confirmed' },
  PENDING_PAYMENT:  { cls: 'badge-yellow', label: 'Pending Payment' },
  CANCELLED:        { cls: 'badge-red',    label: 'Cancelled' },
  REFUND_INITIATED: { cls: 'badge-blue',   label: 'Refund Initiated' },
  FAILED:           { cls: 'badge-red',    label: 'Failed' },
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(false)
  const [filter, setFilter]     = useState('')
  const [cancelling, setCancelling] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const params = { page: 0, size: 20 }
      if (filter) params.status = filter
      const res = await bookingAPI.myBookings(params)
      setBookings(res.data.content || res.data || [])
    } catch {
      setBookings(MOCK_BOOKINGS)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking and initiate refund?')) return
    setCancelling(bookingId)
    try {
      await bookingAPI.cancel(bookingId)
      fetchBookings()
    } catch {
      alert('Cancellation initiated (demo mode)')
      fetchBookings()
    } finally {
      setCancelling(null)
    }
  }

  const fmt = (str) => {
    if (!str) return ''
    return new Date(str).toLocaleString('en-IN', {
      dateStyle: 'medium', timeStyle: 'short'
    })
  }

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <h1 className="page-title">My Bookings</h1>
      <p className="page-subtitle">View and manage your ticket bookings</p>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {['', 'CONFIRMED', 'PENDING_PAYMENT', 'CANCELLED'].map(s => (
          <button key={s}
            onClick={() => { setFilter(s); setTimeout(fetchBookings, 0) }}
            className="btn btn-sm"
            style={{
              background: filter === s ? '#e50914' : 'transparent',
              color: filter === s ? '#fff' : '#888',
              border: `1px solid ${filter === s ? '#e50914' : '#333'}`
            }}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading && <div className="spinner" />}

      {!loading && bookings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>No bookings yet</p>
          <button className="btn btn-primary" onClick={() => navigate('/movies')}>
            Browse Movies
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {bookings.map(bk => {
          const sb = STATUS_BADGE[bk.status] || { cls: 'badge-blue', label: bk.status }
          return (
            <div key={bk.id} className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#e50914' }}>
                      {String(bk.id).substring(0, 12).toUpperCase()}
                    </span>
                    <span className={`badge ${sb.cls}`}>{sb.label}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                    {bk.movieTitle || 'Movie Booking'}
                  </h3>
                  <p style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                    {bk.theatreName || 'Theatre'} {bk.showTime ? `· ${fmt(bk.showTime)}` : ''}
                  </p>
                  {bk.seats && (
                    <p style={{ fontSize: 12, color: '#555' }}>
                      Seats: {bk.seats.map(s => s.seatLabel || s).join(', ')}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: '#e50914', marginBottom: 4 }}>
                    ₹{bk.totalAmount}
                  </p>
                  {bk.discountApplied > 0 && (
                    <p style={{ fontSize: 12, color: '#22c55e', marginBottom: 8 }}>
                      Saved ₹{bk.discountApplied}
                    </p>
                  )}
                  {bk.status === 'CONFIRMED' && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleCancel(bk.id)}
                      disabled={cancelling === bk.id}
                    >
                      {cancelling === bk.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const MOCK_BOOKINGS = [
  { id: 'bkg-abc123def456', movieTitle: 'Pushpa 2', theatreName: 'PVR Forum Mall', showTime: new Date().toISOString(), status: 'CONFIRMED',       totalAmount: 625, discountApplied: 125, seats: [{ seatLabel: 'D4' }, { seatLabel: 'D5' }, { seatLabel: 'D6' }] },
  { id: 'bkg-xyz789ghi012', movieTitle: 'KGF 3',    theatreName: 'INOX Garuda',    showTime: new Date().toISOString(), status: 'PENDING_PAYMENT', totalAmount: 400, discountApplied: 100, seats: [{ seatLabel: 'F3' }, { seatLabel: 'F4' }] },
]
