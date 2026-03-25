import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(null)

  // Restore from localStorage on page reload
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser  = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = (authData) => {
    setToken(authData.token)
    setUser({ userId: authData.userId, role: authData.role })
    localStorage.setItem('token', authData.token)
    localStorage.setItem('user', JSON.stringify({ userId: authData.userId, role: authData.role }))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const isAuthenticated = !!token
  const isCustomer      = user?.role === 'CUSTOMER'
  const isTheatreAdmin  = user?.role === 'THEATRE_ADMIN'

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, isCustomer, isTheatreAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
