import { supabase } from './supabase'
import { authService } from './auth'
import { usersApi } from './api/endpoints/users'
import { useAuthStore } from '@/stores/useAuthStore'
import type { User } from '@/types/user'

/**
 * Sync the backend profile for the given user.
 * Creates the profile on first login and returns the real role from the DB.
 * Returns the updated user, or the original user if the sync fails.
 */
async function syncBackendProfile(user: User): Promise<User> {
  try {
    const profile = await usersApi.getProfile()
    return { ...user, role: profile.role }
  } catch {
    // If the sync fails (e.g. email not whitelisted) keep the local user as-is.
    return user
  }
}

/**
 * Initialize authentication state listener.
 * Subscribes to Supabase auth state changes and updates Zustand store.
 */
export const initAuth = () => {
  // Check initial session — safe to call backend here (not inside onAuthStateChange)
  authService
    .getCurrentUser()
    .then(async (user) => {
      if (user) {
        const synced = await syncBackendProfile(user)
        useAuthStore.getState().setUser(synced)
      } else {
        useAuthStore.getState().setUser(null)
      }
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
        // Pass session explicitly to avoid calling getSession() inside this callback (deadlock risk)
        const user = await authService.getCurrentUser(session)
        useAuthStore.getState().setUser(user)

        // Defer the backend profile sync: the API client interceptor calls getSession(),
        // which deadlocks if invoked directly inside onAuthStateChange.
        if (user) {
          setTimeout(async () => {
            const synced = await syncBackendProfile(user)
            useAuthStore.getState().setUser(synced)
          }, 0)
        }
      } else {
        // User signed out or session expired
        useAuthStore.getState().clearUser()
      }
    } catch (error) {
      console.error('Error in auth state change handler:', error)
      useAuthStore.getState().clearUser()
    }
  })

  // Return cleanup function
  return () => {
    subscription.unsubscribe()
  }
}
