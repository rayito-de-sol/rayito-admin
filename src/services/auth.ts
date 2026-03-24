import { supabase } from './supabase'
import type { User } from '@/types/user'

/**
 * Authentication service
 * Handles sign in, sign out, and session management
 */

export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  /**
   * Sign out current user
   */
  async signOut() {
    console.log('authService.signOut: Calling supabase.auth.signOut()...')
    const { error } = await supabase.auth.signOut()
    console.log('authService.signOut: Supabase signOut completed, error:', error)
    if (error) throw error
    console.log('authService.signOut: Successfully signed out')
  },

  /**
   * Get current session
   */
  async getCurrentSession() {
    console.log('authService.getCurrentSession: Calling supabase.auth.getSession()...')
    const { data, error } = await supabase.auth.getSession()
    console.log('authService.getCurrentSession: Response received, error:', error, 'session exists:', !!data.session)
    if (error) {
      console.error('authService.getCurrentSession: Error getting session:', error)
      throw error
    }
    console.log('authService.getCurrentSession: Returning session')
    return data.session
  },

  /**
   * Get current user from session
   */
  async getCurrentUser(): Promise<User | null> {
    console.log('authService.getCurrentUser: Starting...')

    console.log('authService.getCurrentUser: Calling getCurrentSession()...')
    const session = await this.getCurrentSession()
    console.log('authService.getCurrentUser: Session retrieved:', !!session, 'User exists:', !!session?.user)

    if (!session?.user) {
      console.log('authService.getCurrentUser: No session or user, returning null')
      return null
    }

    console.log('authService.getCurrentUser: Mapping Supabase user to User type...')
    console.log('authService.getCurrentUser: User data:', {
      id: session.user.id,
      email: session.user.email,
      metadata: session.user.user_metadata,
      created_at: session.user.created_at,
      updated_at: session.user.updated_at,
    })

    // Map Supabase user to our User type
    const user: User = {
      id: session.user.id,
      email: session.user.email!,
      role: 'analyst' as const, // Default role, will be fetched from backend
      fullName: session.user.user_metadata?.full_name || null,
      createdAt: new Date(session.user.created_at),
      updatedAt: new Date(session.user.updated_at || session.user.created_at),
    }

    console.log('authService.getCurrentUser: User mapped successfully:', user)
    return user
  },
}
