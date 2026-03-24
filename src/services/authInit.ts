import { supabase } from './supabase'
import { authService } from './auth'
import { useAuthStore } from '@/stores/useAuthStore'

/**
 * Initialize authentication state listener
 * Subscribes to Supabase auth state changes and updates Zustand store
 */
export const initAuth = () => {
  // Check initial session
  authService.getCurrentUser().then((user) => {
    useAuthStore.getState().setUser(user)
  })

  // Listen for auth state changes
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event)

    if (session?.user) {
      // User signed in or session refreshed
      const user = await authService.getCurrentUser()
      useAuthStore.getState().setUser(user)
    } else {
      // User signed out or session expired
      useAuthStore.getState().clearUser()
    }
  })

  // Return cleanup function
  return () => {
    subscription.unsubscribe()
  }
}
