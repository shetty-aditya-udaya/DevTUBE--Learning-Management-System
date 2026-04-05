import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(() => {
    return localStorage.getItem('is_first_time') === 'true'
  })

  // Re-hydrate from localStorage and validate token against server on mount
  useEffect(() => {
    const token  = localStorage.getItem('access_token')
    const stored = localStorage.getItem('user')

    if (!token || !stored) {
      setLoading(false)
      return
    }

    // Optimistically set user from cache, then verify with server
    setUser(JSON.parse(stored))

    api.get('/auth/me')
      .then(res => {
        // Server confirms token is valid — update user from authoritative source
        const freshUser = res.data.data?.user
        if (freshUser) {
          setUser(freshUser)
          localStorage.setItem('user', JSON.stringify(freshUser))
        }
      })
      .catch(() => {
        // Token is expired or invalid — clear everything silently
        console.warn('[AuthContext] Stored token invalid or expired — logging out')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    console.log('[AuthContext] Attempting Login:', { email })
    try {
      const res = await api.post('/auth/login', { email, password })
      console.log('[AuthContext] Login Success:', res.data)
      const { user, access_token, refresh_token } = res.data.data
      
      // Update storage first
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.removeItem('is_first_time')
      
      // Synchronously update multiple states if needed
      setIsFirstTimeUser(false)
      setUser(user)
      
      return user
    } catch (err) {
      console.error('[AuthContext] Login Error:', err)
      throw err
    }
  }, [])

  const signup = useCallback(async (name, email, password, role = 'student') => {
    console.log('[AuthContext] Attempting Signup:', { name, email, role })
    try {
      const res = await api.post('/auth/signup', { name, email, password, role })
      console.log('[AuthContext] Signup Success:', res.data)
      
      // For strict auth gate: Do NOT auto-login.
      // Set first time user flag to true for the success message.
      localStorage.setItem('is_first_time', 'true')
      setIsFirstTimeUser(true)
      
      return res.data.data.user
    } catch (err) {
      console.error('[AuthContext] Signup Error:', err)
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    localStorage.removeItem('is_first_time')
    setIsFirstTimeUser(false)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isFirstTimeUser, 
      setIsFirstTimeUser,
      login, 
      signup, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
