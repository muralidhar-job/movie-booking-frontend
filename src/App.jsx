import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import LoginPage       from './pages/LoginPage'
import RegisterPage    from './pages/RegisterPage'
import MoviesPage      from './pages/MoviesPage'
import ShowsPage       from './pages/ShowsPage'
import BookingPage     from './pages/BookingPage'
import MyBookingsPage  from './pages/MyBookingsPage'
import OffersPage      from './pages/OffersPage'

// B2B Admin Pages
import AdminDashboard  from './pages/admin/AdminDashboard'
import AdminShows      from './pages/admin/AdminShows'

// Layout
import Navbar          from './components/common/Navbar'

// Protected route wrapper
function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role && user?.role !== role) return <Navigate to="/movies" replace />
  return children
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Navigate to="/movies" replace />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/movies"   element={<MoviesPage />} />
        <Route path="/offers"   element={<OffersPage />} />

        {/* B2C — Customer */}
        <Route path="/movies/:movieId/shows" element={
          <ProtectedRoute><ShowsPage /></ProtectedRoute>
        }/>
        <Route path="/booking/:showId" element={
          <ProtectedRoute role="CUSTOMER"><BookingPage /></ProtectedRoute>
        }/>
        <Route path="/my-bookings" element={
          <ProtectedRoute role="CUSTOMER"><MyBookingsPage /></ProtectedRoute>
        }/>

        {/* B2B — Theatre Admin */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role="THEATRE_ADMIN"><AdminDashboard /></ProtectedRoute>
        }/>
        <Route path="/admin/shows" element={
          <ProtectedRoute role="THEATRE_ADMIN"><AdminShows /></ProtectedRoute>
        }/>

        <Route path="*" element={<Navigate to="/movies" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
