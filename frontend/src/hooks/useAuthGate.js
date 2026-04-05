import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * useAuthGate
 * Custom hook to intercept navigation and redirect to login if not authenticated.
 */
export const useAuthGate = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  /**
   * gate
   * @param {string} targetPath - The path to navigate to if authenticated
   * @param {string} [mode] - Optional mode ('login' or 'signup') for the auth page
   */
  const gate = (targetPath, mode = 'login') => {
    if (user) {
      navigate(targetPath)
    } else {
      // Redirect to auth page, passing the intended destination and mode in state
      navigate('/auth', { state: { from: targetPath, mode } })
    }
  }

  return { gate, isLoggedIn: !!user }
}
