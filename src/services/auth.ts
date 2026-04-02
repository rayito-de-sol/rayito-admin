import { supabase } from './supabase'
import type { User } from '@/types/user'
import type { Session } from '@supabase/supabase-js'

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
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /**
   * Get current session
   */
  async getCurrentSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  /**
   * Get current user from session
   * @param providedSession - Optional session to use instead of fetching
   */
  async getCurrentUser(providedSession?: Session | null): Promise<User | null> {
    const session = providedSession || (await this.getCurrentSession())

    if (!session?.user) return null

    // Map Supabase user to our User type
    return {
      id: session.user.id,
      email: session.user.email!,
      role: 'admin' as const, // Default role, will be fetched from backend
      fullName: session.user.user_metadata?.full_name || null,
      createdAt: new Date(session.user.created_at),
      updatedAt: new Date(session.user.updated_at || session.user.created_at),
    }
  },
}
