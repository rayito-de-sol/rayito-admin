import { supabase } from './supabase'
import { authService } from './auth'
import { useAuthStore } from '@/stores/useAuthStore'

/**
 * Initialize authentication state listener
 * Subscribes to Supabase auth state changes and updates Zustand store
 */
export const initAuth = () => {
  // Check initial session
  authService
    .getCurrentUser()
    .then((user) => {
      useAuthStore.getState().setUser(user)
    })
    .catch((error) => {
      console.error('Error getting initial user:', error)
    })

  // Listen for auth state changes
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_event, session) => {
    try {
      if (session?.user) {
        // User signed in or session refreshed
        const user = await authService.getCurrentUser(session)
        useAuthStore.getState().setUser(user)
      } else {
        // User signed out or session expired
        useAuthStore.getState().clearUser()
      }
    } catch (error) {
      console.error('Error in auth state change handler:', error)
      // Clear user on error
      useAuthStore.getState().clearUser()
    }
  })

  // Return cleanup function
  return () => {
    subscription.unsubscribe()
  }
}
