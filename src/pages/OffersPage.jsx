import React, { useState, useEffect } from 'react'
import { offerAPI } from '../services/api'

export default function OffersPage() {
  const [offers, setOffers]   = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    offerAPI.list({})
      .then(r => setOffers(r.data || []))
      .catch(() => setOffers(MOCK_OFFERS))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <h1 className="page-title">Offers &amp; Discounts</h1>
      <p className="page-subtitle">Exclusive deals on movie tickets</p>

      {loading && <div className="spinner" />}

      <div className="grid-2">
        {offers.map((offer, i) => (
          <div key={i} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <code style={{
                fontSize: 18, fontWeight: 700, color: '#e50914',
                background: 'rgba(229,9,20,0.1)', padding: '4px 12px',
                borderRadius: 6, border: '1px solid rgba(229,9,20,0.2)'
              }}>
                {offer.code}
              </code>
              <span className="badge badge-green">Active</span>
            </div>
            <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
              {offer.description}
            </p>
            {offer.validUntil && (
              <p style={{ fontSize: 12, color: '#555' }}>
                Valid until: {new Date(offer.validUntil).toLocaleDateString('en-IN')}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const MOCK_OFFERS = [
  { code: 'THIRD50', description: '50% discount on the third ticket. Book 3 or more tickets and save on your third seat.', validUntil: '2025-12-31' },
  { code: 'AFTERNOON20', description: '20% off on afternoon shows (12:00 PM – 5:00 PM). Book any afternoon show and enjoy flat 20% discount.', validUntil: '2025-12-31' },
]
