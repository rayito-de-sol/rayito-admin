import axios from 'axios'
import { config } from '@/config'
import { supabase } from '../supabase'

/**
 * Axios client instance for API communication
 * Configured with base URL, timeout, and default headers
 */
export const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

/**
 * Request interceptor: Inject JWT token from Supabase session
 */
apiClient.interceptors.request.use(
  async (config) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor: Handle errors consistently with Spanish messages
 */
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    // Network error (no response)
    if (!error.response) {
      error.message = 'Error de conexión. Verifique su red e intente nuevamente'
      return Promise.reject(error)
    }

    const status = error.response.status

    // Handle common HTTP errors
    switch (status) {
      case 401:
        // Unauthorized - sign out user
        error.message = 'Sesión expirada. Por favor, inicie sesión nuevamente'
        // Sign out and redirect to login handled by auth state listener
        await supabase.auth.signOut()
        break
      case 403:
        error.message = 'No tienes permiso para realizar esta acción'
        break
      case 404:
        error.message = 'Recurso no encontrado'
        break
      case 500:
        error.message =
          error.response.data?.error?.message ||
          error.response.data?.message ||
          'Error del servidor. Intente nuevamente más tarde'
        break
      default:
        if (error.response.data?.error?.message) {
          error.message = error.response.data.error.message
        } else if (error.response.data?.message) {
          error.message = error.response.data.message
        }
    }

    return Promise.reject(error)
  }
)
