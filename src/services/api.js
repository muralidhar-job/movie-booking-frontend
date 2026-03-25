import axios from 'axios'

// All requests go to API Gateway on port 8080
// Vite proxy forwards /api → http://localhost:8080
const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT token to every request automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 — clear token and redirect to login
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth APIs ─────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getProfile: ()  => api.get('/users/me')
}

// ── Movie APIs ────────────────────────────────────────────
export const movieAPI = {
  browse: (params) => api.get('/movies', { params }),
  getById: (id)    => api.get(`/movies/${id}`),
  getShows: (movieId, city, date) =>
    api.get(`/movies/${movieId}/shows`, { params: { city, date } })
}

// ── Booking APIs ──────────────────────────────────────────
export const bookingAPI = {
  create:   (data)      => api.post('/bookings', data),
  getById:  (id)        => api.get(`/bookings/${id}`),
  myBookings: (params)  => api.get('/bookings/my', { params }),
  cancel:   (id)        => api.delete(`/bookings/${id}`)
}

// ── Offer APIs ────────────────────────────────────────────
export const offerAPI = {
  list:  (params) => api.get('/offers', { params }),
  apply: (params) => api.post('/offers/apply', null, { params })
}

// ── Theatre APIs (B2B) ────────────────────────────────────
export const theatreAPI = {
  getByCity:   (city)                  => api.get('/theatres', { params: { city } }),
  onboard:     (data)                  => api.post('/theatres', data),
  getShows:    (theatreId)             => api.get(`/theatres/${theatreId}/shows`),
  createShow:  (theatreId, data)       => api.post(`/theatres/${theatreId}/shows`, data),
  updateShow:  (theatreId, showId, d)  => api.put(`/theatres/${theatreId}/shows/${showId}`, d),
  deleteShow:  (theatreId, showId)     => api.delete(`/theatres/${theatreId}/shows/${showId}`),
  allocSeats:  (theatreId, screenId, d)=> api.post(`/theatres/${theatreId}/screens/${screenId}/seats`, d)
}

export default api
