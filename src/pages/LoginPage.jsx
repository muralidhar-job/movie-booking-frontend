import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login }           = useAuth()
  const navigate            = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      login(res.data)
      // Redirect based on role
      if (res.data.role === 'THEATRE_ADMIN') navigate('/admin/dashboard')
      else navigate('/movies')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: '#888', fontSize: 14 }}>Sign in to your CineBook account</p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#888' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#e50914', textDecoration: 'none' }}>
              Register
            </Link>
          </p>
        </div>

        {/* Demo credentials hint */}
        <div style={{ marginTop: 16, padding: '12px 16px', background: '#1a1a1a', borderRadius: 8, fontSize: 12, color: '#666', border: '1px solid #2a2a2a' }}>
          <strong style={{ color: '#888' }}>Demo:</strong> Register first, then login.
          Use role <code style={{ color: '#e50914' }}>CUSTOMER</code> for booking or{' '}
          <code style={{ color: '#e50914' }}>THEATRE_ADMIN</code> for admin panel.
        </div>
      </div>
    </div>
  )
}
