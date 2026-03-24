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
    console.log('useAuth.signOut: Starting logout...')
    try {
      setLoading(true)
      setError(null)

      console.log('useAuth.signOut: Calling authService.signOut()...')
      await authService.signOut()
      console.log('useAuth.signOut: authService.signOut() completed')

      console.log('useAuth.signOut: Clearing user from store...')
      clearUser()
      console.log('useAuth.signOut: User cleared, isAuthenticated:', useAuthStore.getState().isAuthenticated)
    } catch (error) {
      console.error('useAuth.signOut: Error during logout:', error)
      const message =
        error instanceof Error ? error.message : 'Error al cerrar sesión'
      setError(message)
      throw error
    } finally {
      console.log('useAuth.signOut: Setting loading to false')
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
