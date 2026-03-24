/**
 * API-related type definitions
 */

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface ApiResponse<T> {
  data: T
  error?: ApiError
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
