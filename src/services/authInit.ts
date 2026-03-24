import { supabase } from './supabase'
import { authService } from './auth'
import { useAuthStore } from '@/stores/useAuthStore'

/**
 * Initialize authentication state listener
 * Subscribes to Supabase auth state changes and updates Zustand store
 */

// Track if we're currently processing an auth state change to prevent concurrent updates
let isProcessingAuthChange = false

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
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] Auth state changed:`, event, 'user:', session?.user?.email, 'session exists:', !!session)

    // Prevent concurrent processing
    if (isProcessingAuthChange) {
      console.log(`[${timestamp}] Already processing auth change, skipping...`)
      return
    }

    isProcessingAuthChange = true
    console.log(`[${timestamp}] Starting auth state processing...`)

    try {
      if (session?.user) {
        // User signed in or session refreshed
        console.log(`[${timestamp}] Session exists, getting user from session...`)
        try {
          const user = await authService.getCurrentUser()
          console.log(`[${timestamp}] User mapped:`, user)
          useAuthStore.getState().setUser(user)
          console.log(`[${timestamp}] Auth store updated, isAuthenticated:`, useAuthStore.getState().isAuthenticated)
        } catch (userError) {
          console.error(`[${timestamp}] Error getting current user:`, userError)
          console.error(`[${timestamp}] Error stack:`, userError instanceof Error ? userError.stack : 'No stack trace')
          // Clear user on error
          useAuthStore.getState().clearUser()
        }
      } else {
        // User signed out or session expired
        console.log(`[${timestamp}] No session, clearing user. Event:`, event)
        useAuthStore.getState().clearUser()
        console.log(`[${timestamp}] User cleared from store, isAuthenticated:`, useAuthStore.getState().isAuthenticated)
      }
    } catch (error) {
      console.error(`[${timestamp}] Error in auth state change handler:`, error)
      console.error(`[${timestamp}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace')
    } finally {
      console.log(`[${timestamp}] Auth state processing complete, releasing lock`)
      isProcessingAuthChange = false
    }
  })

  // Return cleanup function
  return () => {
    subscription.unsubscribe()
  }
}
