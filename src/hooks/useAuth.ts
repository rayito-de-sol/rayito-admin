import { useAuthStore } from '@/stores/useAuthStore'
import { authService } from '@/services/auth'
import { useUIStore } from '@/stores/useUIStore'

/**
 * Authentication hook
 * Provides easy access to auth state and actions
 */
export const useAuth = () => {
  const { user, isAuthenticated, clearUser } = useAuthStore()
  const { setLoading, setError } = useUIStore()

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      await authService.signIn(email, password)
      // User state will be updated by onAuthStateChange listener
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al iniciar sesión'
      setError(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      await authService.signOut()
      clearUser()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error al cerrar sesión'
      setError(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    isAuthenticated,
    signIn,
    signOut,
  }
}
