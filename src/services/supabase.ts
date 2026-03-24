import { createClient } from '@supabase/supabase-js'
import { config } from '@/config'

/**
 * Supabase client instance
 * Handles authentication and session management
 */
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)
