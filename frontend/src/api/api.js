import axios from 'axios'

// In production on Vercel, this points to your Render backend URL.
// Locally it defaults to '/api' which Vite proxies to localhost:5000.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
    hasToken: !!token,
    data: config.data
  })
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      // Avoid redirect loops if the 401 happens on the login endpoint itself
      if (original.url.includes('/auth/login')) {
        console.warn('[API Auth] 401 on login - Incorrect credentials.')
        return Promise.reject(error)
      }

      console.warn('[API Response] 401 Unauthorized - Attempting Refresh')
      original._retry = true
      const refreshToken = localStorage.getItem('refresh_token')
      
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` },
          })
          const newToken = res.data.data.access_token
          localStorage.setItem('access_token', newToken)
          original.headers.Authorization = `Bearer ${newToken}`
          console.log('[API Refresh] Success - Retrying original request')
          return api(original)
        } catch (refreshErr) {
          console.error('[API Refresh] Failed', refreshErr)
          localStorage.clear()
          window.location.href = '/auth'
        }
      } else {
        console.warn('[API Auth] No refresh token found - Redirecting to /auth')
        localStorage.clear()
        window.location.href = '/auth'
      }
    }
    console.error(`[API Response Error] ${error.response?.status}`, error.response?.data)
    return Promise.reject(error)
  }
)

export default api
