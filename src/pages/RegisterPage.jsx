import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', city: '', role: 'CUSTOMER'
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login }             = useAuth()
  const navigate              = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.register(form)
      login(res.data)
      if (res.data.role === 'THEATRE_ADMIN') navigate('/admin/dashboard')
      else navigate('/movies')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Create account</h1>
          <p style={{ color: '#888', fontSize: 14 }}>Join CineBook — book tickets in seconds</p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Account type</label>
              <select className="form-select" value={form.role} onChange={set('role')}>
                <option value="CUSTOMER">Customer — book tickets</option>
                <option value="THEATRE_ADMIN">Theatre Admin — manage shows</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input className="form-input" placeholder="Your name"
                  value={form.name} onChange={set('name')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="+91 98765 43210"
                  value={form.phone} onChange={set('phone')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={set('email')} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="Min 8 characters"
                value={form.password} onChange={set('password')} required minLength={8} />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <select className="form-select" value={form.city} onChange={set('city')}>
                <option value="">Select city</option>
                {['Bengaluru','Mumbai','Delhi','Hyderabad','Chennai','Pune','Kolkata'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#888' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#e50914', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
