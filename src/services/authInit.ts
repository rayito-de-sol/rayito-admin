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
      console.log('Initial user session:', user)
      useAuthStore.getState().setUser(user)
    })
    .catch((error) => {
      console.error('Error getting initial user:', error)
    })

  // Listen for auth state changes
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event, session?.user?.email)

    try {
      if (session?.user) {
        // User signed in or session refreshed
        console.log('Getting user from session...')
        const user = await authService.getCurrentUser()
        console.log('User mapped:', user)
        useAuthStore.getState().setUser(user)
        console.log('Auth store updated, isAuthenticated:', useAuthStore.getState().isAuthenticated)
      } else {
        // User signed out or session expired
        console.log('Clearing user session')
        useAuthStore.getState().clearUser()
      }
    } catch (error) {
      console.error('Error in auth state change handler:', error)
    }
  })

  // Return cleanup function
  return () => {
    subscription.unsubscribe()
  }
}
