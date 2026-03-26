import { apiClient } from './api/client'
import type { Store, CreateStoreRequest, UpdateStoreRequest } from '@/types/store'
import { AxiosError } from 'axios'

/**
 * Stores service
 * Handles all store CRUD operations with backend API
 */

/**
 * Map API error codes to Spanish error messages
 */
const getStoreErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const errorCode = error.response?.data?.code

    // Handle store-specific error codes
    if (status === 409 || errorCode === 'DUPLICATE_IDENTITY') {
      return 'Ya existe una tienda con este número de identificación'
    }

    if (status === 404 || errorCode === 'STORE_NOT_FOUND') {
      return 'Tienda no encontrada'
    }

    if (status === 403) {
      return 'No tienes permisos para realizar esta operación'
    }

    if (status === 400 || errorCode === 'VALIDATION_FAILED') {
      // Use backend validation message if available
      const backendMessage = error.response?.data?.message
      if (backendMessage) return backendMessage
      return 'Datos inválidos. Por favor, verifique los campos'
    }

    if (status === 500) {
      return 'Error del servidor. Por favor, intenta de nuevo más tarde'
    }

    // Return error message from interceptor or default
    return error.message || 'Error desconocido'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Error desconocido'
}

export const storesService = {
  /**
   * List all stores
   * @returns Array of all stores with nested address and config data
   */
  async listStores(): Promise<Store[]> {
    try {
      const response = await apiClient.get<Store[]>('/stores')
      return response.data
    } catch (error) {
      const message = getStoreErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Get store by ID
   * @param id Store UUID
   * @returns Store object with nested address and config data
   */
  async getStore(id: string): Promise<Store> {
    try {
      const response = await apiClient.get<Store>(`/stores/${id}`)
      return response.data
    } catch (error) {
      const message = getStoreErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Create new store
   * @param data Store creation data
   * @returns Created store with generated ID
   */
  async createStore(data: CreateStoreRequest): Promise<Store> {
    try {
      const response = await apiClient.post<Store>('/stores', data)
      return response.data
    } catch (error) {
      const message = getStoreErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Update existing store
   * @param id Store UUID
   * @param data Partial update data (only fields to update)
   * @returns Updated store object
   */
  async updateStore(id: string, data: UpdateStoreRequest): Promise<Store> {
    try {
      const response = await apiClient.patch<Store>(`/stores/${id}`, data)
      return response.data
    } catch (error) {
      const message = getStoreErrorMessage(error)
      throw new Error(message)
    }
  },
}
