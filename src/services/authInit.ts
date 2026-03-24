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
    console.log('Auth state changed:', event, 'user:', session?.user?.email, 'session exists:', !!session)

    try {
      if (session?.user) {
        // User signed in or session refreshed
        console.log('Session exists, getting user from session...')
        const user = await authService.getCurrentUser()
        console.log('User mapped:', user)
        useAuthStore.getState().setUser(user)
        console.log('Auth store updated, isAuthenticated:', useAuthStore.getState().isAuthenticated)
      } else {
        // User signed out or session expired
        console.log('No session, clearing user. Event:', event)
        useAuthStore.getState().clearUser()
        console.log('User cleared from store, isAuthenticated:', useAuthStore.getState().isAuthenticated)
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
