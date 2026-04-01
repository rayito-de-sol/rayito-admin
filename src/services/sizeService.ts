import { apiClient } from './api/client'
import type { Size, CreateSizeRequest } from '@/types/size'
import { AxiosError } from 'axios'

/**
 * Map API error codes to Spanish error messages
 */
const getSizeErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const errorCode = error.response?.data?.code

    if (status === 409 || errorCode === 'DUPLICATE_SIZE_LABEL') {
      return 'Ya existe una talla con esta etiqueta para este producto'
    }

    if (errorCode === 'PRODUCT_NOT_FOUND') {
      return 'Producto no encontrado'
    }

    if (status === 400 || errorCode === 'VALIDATION_FAILED') {
      const backendMessage = error.response?.data?.message
      if (backendMessage) return backendMessage
      return 'Datos inválidos. Por favor, verifique los campos'
    }

    if (status === 403) {
      return 'No tienes permisos para realizar esta operación'
    }

    if (status === 500) {
      return 'Error del servidor. Por favor, intenta de nuevo más tarde'
    }

    return error.message || 'Error desconocido'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Error desconocido'
}

/**
 * Size service
 * Handles size CRUD operations
 */
export const sizeService = {
  /**
   * Create new size for a product
   * @param productId Product UUID
   * @param data Size creation data
   * @returns Created size
   */
  async createSize(productId: string, data: CreateSizeRequest): Promise<Size> {
    try {
      const response = await apiClient.post<Size>(
        `/products/${productId}/sizes`,
        data
      )
      return response.data
    } catch (error) {
      const message = getSizeErrorMessage(error)
      throw new Error(message)
    }
  },
}
