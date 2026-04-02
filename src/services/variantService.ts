import { apiClient } from './api/client'
import type {
  Variant,
  CreateVariantRequest,
  VariantCost,
} from '@/types/variant'
import { AxiosError } from 'axios'

/**
 * Map API error codes to Spanish error messages
 */
const getVariantErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const errorCode = error.response?.data?.code

    if (status === 404 || errorCode === 'VARIANT_NOT_FOUND') {
      return 'Variante no encontrada'
    }

    if (status === 409 || errorCode === 'DUPLICATE_SKU') {
      return 'Ya existe una variante con este SKU'
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
 * Variant service
 * Handles all variant CRUD operations, stock, cost, and cost history
 */
export const variantService = {
  /**
   * List all variants with product info (for set creation)
   * @returns Array of all variants
   */
  async listVariants(): Promise<Variant[]> {
    try {
      const response = await apiClient.get<Variant[]>('/variants')
      return response.data
    } catch (error) {
      const message = getVariantErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Create new variant for a product
   * @param productId Product UUID
   * @param data Variant creation data
   * @returns Created variant
   */
  async createVariant(
    productId: string,
    data: CreateVariantRequest
  ): Promise<Variant> {
    try {
      const response = await apiClient.post<Variant>(
        `/products/${productId}/variants`,
        data
      )
      return response.data
    } catch (error) {
      const message = getVariantErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Get variant by ID
   * @param id Variant UUID
   * @returns Variant object
   */
  async getVariant(id: string): Promise<Variant> {
    try {
      const response = await apiClient.get<Variant>(`/variants/${id}`)
      return response.data
    } catch (error) {
      const message = getVariantErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Update variant stock
   * @param id Variant UUID
   * @param stock New stock amount
   * @returns Updated variant
   */
  async updateStock(id: string, stock: number): Promise<Variant> {
    try {
      const response = await apiClient.patch<Variant>(`/variants/${id}/stock`, {
        stock,
      })
      return response.data
    } catch (error) {
      const message = getVariantErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Update variant cost (creates new cost record)
   * @param id Variant UUID
   * @param amount New cost amount
   * @returns Updated variant
   */
  async updateCost(id: string, amount: number): Promise<Variant> {
    try {
      const response = await apiClient.patch<Variant>(`/variants/${id}/cost`, {
        amount,
      })
      return response.data
    } catch (error) {
      const message = getVariantErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Get variant cost history
   * @param id Variant UUID
   * @returns Array of cost records
   */
  async getCostHistory(id: string): Promise<VariantCost[]> {
    try {
      const response = await apiClient.get<VariantCost[]>(
        `/variants/${id}/cost-history`
      )
      return response.data
    } catch (error) {
      const message = getVariantErrorMessage(error)
      throw new Error(message)
    }
  },
}
