import React, { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { bookingAPI, offerAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

// Generate a mock seat layout for demo
const generateSeats = () => {
  const rows = ['A','B','C','D','E','F','G','H']
  const seatsPerRow = 10
  return rows.flatMap(row =>
    Array.from({ length: seatsPerRow }, (_, i) => ({
      id: `${row}${i + 1}`,
      label: `${row}${i + 1}`,
      row,
      number: i + 1,
      category: row <= 'B' ? 'RECLINER' : row <= 'D' ? 'PREMIUM' : 'REGULAR',
      price: row <= 'B' ? 450 : row <= 'D' ? 300 : 200,
      status: Math.random() < 0.25 ? 'BOOKED' : 'AVAILABLE'
    }))
  )
}

const CATEGORY_COLOR = {
  RECLINER: { bg: '#7c3aed22', border: '#7c3aed', text: '#a78bfa' },
  PREMIUM:  { bg: '#b4530822', border: '#e50914', text: '#f87171' },
  REGULAR:  { bg: '#0f3a6022', border: '#3b82f6', text: '#93c5fd' }
}

export default function BookingPage() {
  const { showId }              = useParams()
  const { state }               = useLocation()
  const { user }                = useAuth()
  const navigate                = useNavigate()
  const show                    = state?.show  || { id: showId }
  const movie                   = state?.movie || { title: 'Movie' }

  const [seats]                 = useState(generateSeats)
  const [selected, setSelected] = useState([])
  const [offerCode, setOffer]   = useState('')
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading]   = useState(false)
  const [booked, setBooked]     = useState(null)
  const [error, setError]       = useState('')

  const toggle = (seat) => {
    if (seat.status === 'BOOKED') return
    setSelected(prev =>
      prev.find(s => s.id === seat.id)
        ? prev.filter(s => s.id !== seat.id)
        : [...prev, seat]
    )
    setDiscount(0)  // reset discount on selection change
  }

  const subtotal = selected.reduce((sum, s) => sum + s.price, 0)
  const total    = subtotal - discount

  const applyOffer = async () => {
    if (!offerCode || selected.length === 0) return
    try {
      const res = await offerAPI.apply({
        offerCode,
        ticketCount: selected.length,
        basePrice: selected[0]?.price || 200
      })
      setDiscount(res.data.discountAmount || 0)
    } catch {
      // Demo fallback calculation
      if (offerCode === 'THIRD50' && selected.length >= 3) {
        setDiscount(Math.min(...selected.map(s => s.price)) * 0.5)
      } else if (offerCode === 'AFTERNOON20') {
        setDiscount(subtotal * 0.2)
      }
    }
  }

  const handleBook = async () => {
    if (selected.length === 0) { setError('Please select at least one seat'); return }
    setError('')
    setLoading(true)
    try {
      const res = await bookingAPI.create({
        showId: show.id,
        seatLayoutIds: selected.map(s => s.id),
        offerCode: offerCode || null
      })
      setBooked(res.data)
    } catch (err) {
      // Demo: simulate successful booking
      setBooked({
        id: 'BKG-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        status: 'PENDING_PAYMENT',
        totalAmount: total,
        discountApplied: discount,
        seats: selected.map(s => s.label)
      })
    } finally {
      setLoading(false)
    }
  }

  // Booking confirmation screen
  if (booked) {
    return (
      <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ maxWidth: 460, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎟️</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#22c55e' }}>Booking Confirmed!</h2>
          <p style={{ color: '#888', marginBottom: 24 }}>Your seats are reserved. Proceed to payment.</p>

          <div className="card" style={{ padding: 24, textAlign: 'left', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#888', fontSize: 13 }}>Booking ID</span>
              <span style={{ fontWeight: 600, fontFamily: 'monospace', color: '#e50914' }}>
                {typeof booked.id === 'string' ? booked.id.toString().substring(0, 12).toUpperCase() : booked.id}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#888', fontSize: 13 }}>Movie</span>
              <span style={{ fontWeight: 500 }}>{movie.title}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#888', fontSize: 13 }}>Seats</span>
              <span style={{ fontWeight: 500 }}>{selected.map(s => s.label).join(', ')}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#888', fontSize: 13 }}>Discount</span>
                <span style={{ fontWeight: 500, color: '#22c55e' }}>- ₹{discount.toFixed(0)}</span>
              </div>
            )}
            <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Total Amount</span>
              <span style={{ fontWeight: 700, fontSize: 18, color: '#e50914' }}>₹{total.toFixed(0)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>
              My Bookings
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/movies')}>
              Browse More
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '32px 20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 20 }}>←</button>
        <div>
          <h1 className="page-title">{movie.title}</h1>
          <p style={{ fontSize: 13, color: '#666' }}>Select your seats</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

        {/* Seat Map */}
        <div className="card" style={{ padding: 24 }}>
          {/* Screen indicator */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ height: 4, background: 'linear-gradient(90deg, transparent, #e50914, transparent)', borderRadius: 2, marginBottom: 8 }}/>
            <span style={{ fontSize: 12, color: '#555', letterSpacing: 3 }}>SCREEN</span>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 24 }}>
            {Object.entries(CATEGORY_COLOR).map(([cat, colors]) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: colors.bg, border: `1px solid ${colors.border}` }}/>
                <span style={{ fontSize: 11, color: '#888' }}>{cat}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: '#2a2a2a', border: '1px solid #333' }}/>
              <span style={{ fontSize: 11, color: '#888' }}>Booked</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: '#22c55e44', border: '1px solid #22c55e' }}/>
              <span style={{ fontSize: 11, color: '#888' }}>Selected</span>
            </div>
          </div>

          {/* Seat grid */}
          {['A','B','C','D','E','F','G','H'].map(row => (
            <div key={row} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ width: 16, fontSize: 12, color: '#555', textAlign: 'center' }}>{row}</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {seats.filter(s => s.row === row).map(seat => {
                  const isSelected = selected.find(s => s.id === seat.id)
                  const colors     = CATEGORY_COLOR[seat.category]
                  return (
                    <div
                      key={seat.id}
                      onClick={() => toggle(seat)}
                      title={`${seat.label} — ₹${seat.price} (${seat.category})`}
                      style={{
                        width: 30, height: 28,
                        borderRadius: 4,
                        fontSize: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: seat.status === 'BOOKED' ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s',
                        background: seat.status === 'BOOKED'
                          ? '#1a1a1a'
                          : isSelected
                          ? '#22c55e44'
                          : colors.bg,
                        border: `1px solid ${seat.status === 'BOOKED' ? '#2a2a2a' : isSelected ? '#22c55e' : colors.border}`,
                        color: seat.status === 'BOOKED' ? '#333' : isSelected ? '#22c55e' : colors.text,
                        fontWeight: isSelected ? 700 : 400
                      }}
                    >
                      {seat.number}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Booking Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Selected seats */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Booking Summary</h3>

            {selected.length === 0 ? (
              <p style={{ color: '#555', fontSize: 13 }}>No seats selected yet</p>
            ) : (
              <>
                <div style={{ marginBottom: 14 }}>
                  {Object.entries(
                    selected.reduce((acc, s) => {
                      acc[s.category] = (acc[s.category] || [])
                      acc[s.category].push(s)
                      return acc
                    }, {})
                  ).map(([cat, catSeats]) => (
                    <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                      <span style={{ color: '#aaa' }}>
                        {cat} × {catSeats.length} ({catSeats.map(s => s.label).join(', ')})
                      </span>
                      <span>₹{catSeats.reduce((s, x) => s + x.price, 0)}</span>
                    </div>
                  ))}
                </div>

                {/* Offer code */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <input
                    className="form-input"
                    placeholder="Offer code"
                    value={offerCode}
                    onChange={e => setOffer(e.target.value.toUpperCase())}
                    style={{ flex: 1, fontSize: 13 }}
                  />
                  <button className="btn btn-secondary btn-sm" onClick={applyOffer}>Apply</button>
                </div>

                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#22c55e' }}>
                    <span>Discount ({offerCode})</span>
                    <span>- ₹{discount.toFixed(0)}</span>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontWeight: 600 }}>Total</span>
                  <span style={{ fontWeight: 700, fontSize: 18, color: '#e50914' }}>₹{total.toFixed(0)}</span>
                </div>

                {error && <div className="alert alert-error" style={{ fontSize: 12 }}>{error}</div>}

                <button className="btn btn-primary btn-full" onClick={handleBook} disabled={loading}>
                  {loading ? 'Booking...' : `Confirm ${selected.length} Seat${selected.length > 1 ? 's' : ''}`}
                </button>
              </>
            )}
          </div>

          {/* Offer hints */}
          <div className="card" style={{ padding: 16 }}>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 8, fontWeight: 600 }}>Available offers</p>
            <div style={{ fontSize: 12, color: '#666', lineHeight: 1.8 }}>
              <div><code style={{ color: '#e50914' }}>THIRD50</code> — 50% off on 3rd ticket</div>
              <div><code style={{ color: '#eab308' }}>AFTERNOON20</code> — 20% off afternoon shows</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
