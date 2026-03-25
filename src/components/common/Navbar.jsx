import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { isAuthenticated, user, logout, isCustomer, isTheatreAdmin } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) =>
    location.pathname === path ? { color: '#e50914' } : {}

  return (
    <nav style={{
      background: '#111',
      borderBottom: '1px solid #2a2a2a',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60
      }}>
        {/* Logo */}
        <Link to="/movies" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#e50914' }}>
            Cine
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#f0f0f0' }}>
            Book
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          <Link to="/movies" style={{ textDecoration: 'none', color: '#ccc', fontSize: 14, ...isActive('/movies') }}>
            Movies
          </Link>
          <Link to="/offers" style={{ textDecoration: 'none', color: '#ccc', fontSize: 14, ...isActive('/offers') }}>
            Offers
          </Link>

          {isCustomer && (
            <Link to="/my-bookings" style={{ textDecoration: 'none', color: '#ccc', fontSize: 14, ...isActive('/my-bookings') }}>
              My Bookings
            </Link>
          )}

          {isTheatreAdmin && (
            <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: '#ccc', fontSize: 14, ...isActive('/admin/dashboard') }}>
              Admin
            </Link>
          )}
        </div>

        {/* Auth actions */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              <span style={{ fontSize: 13, color: '#888' }}>
                {user?.role === 'THEATRE_ADMIN' ? 'Admin' : 'Customer'}
              </span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
