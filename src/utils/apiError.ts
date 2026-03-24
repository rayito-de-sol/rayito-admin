import { AxiosError } from 'axios'
import type { ApiError } from '@/types/api'

/**
 * Check if error is an Axios error
 */
export const isAxiosError = (error: unknown): error is AxiosError => {
  return (error as AxiosError).isAxiosError === true
}

/**
 * Extract error message from API error
 */
export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    return error.message || 'Error desconocido'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Error desconocido'
}

/**
 * Extract API error details
 */
export const getApiError = (error: unknown): ApiError | null => {
  if (isAxiosError(error) && error.response?.data) {
    const data = error.response.data
    if (typeof data === 'object' && 'code' in data && 'message' in data) {
      return data as ApiError
    }
  }
  return null
}
