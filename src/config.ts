/**
 * Application configuration
 * Validates and exports environment variables
 */

const getEnvVar = (key: string): string => {
  const value = import.meta.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const config = {
  apiUrl: getEnvVar('VITE_API_URL'),
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  },
} as const
