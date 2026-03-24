import { createClient } from '@supabase/supabase-js'
import { config } from '@/config'

/**
 * Supabase client instance
 * Handles authentication and session management
 * Uses publishable key (anon key) for client-side authentication
 */
export const supabase = createClient(
  config.supabase.url,
  config.supabase.publishableKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)
