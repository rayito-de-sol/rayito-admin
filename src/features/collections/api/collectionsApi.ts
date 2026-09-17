import { apiClient } from '@/services/api/client'
import type {
  Collection,
  UpdateCollectionMetadataRequest,
  UpdateCollectionStateRequest,
  CollectionFilters,
} from '../types/collection.types'

/**
 * Endpoints de cuentas de cobro.
 * Se crean automáticamente al registrar una venta a una tienda: no hay alta ni
 * edición de items. `finalize` solo sirve para reintentar un PDF que falló.
 */
export const collectionsApi = {
  /**
   * List collections with optional filters
   */
  async list(filters?: CollectionFilters): Promise<Collection[]> {
    const params = new URLSearchParams()

    if (filters?.customer_id) {
      params.append('customer_id', filters.customer_id)
    }
    if (filters?.state) {
      params.append('state', filters.state)
    }
    if (filters?.from_date) {
      params.append('from_date', filters.from_date)
    }
    if (filters?.to_date) {
      params.append('to_date', filters.to_date)
    }

    const queryString = params.toString()
    const url = queryString ? `/collections?${queryString}` : '/collections'

    const response = await apiClient.get<Collection[]>(url)
    return response.data
  },

  /**
   * Get collection by ID
   */
  async get(id: string): Promise<Collection> {
    const response = await apiClient.get<Collection>(`/collections/${id}`)
    return response.data
  },

  /**
   * Update collection metadata (draft only)
   */
  async updateMetadata(
    id: string,
    data: UpdateCollectionMetadataRequest
  ): Promise<Collection> {
    const payload = {
      ...data,
      payment_due_date: data.payment_due_date
        ? new Date(data.payment_due_date).toISOString()
        : undefined,
    }
    const response = await apiClient.patch<Collection>(
      `/collections/${id}`,
      payload
    )
    return response.data
  },

  /**
   * Finalize collection (generates PDF, transitions to active)
   */
  async finalize(id: string): Promise<Collection> {
    const response = await apiClient.post<Collection>(
      `/collections/${id}/finalize`,
      {}
    )
    return response.data
  },

  /**
   * Get a short-lived signed download URL for a collection's PDF document
   */
  async getDocumentDownloadUrl(documentId: string): Promise<string> {
    const response = await apiClient.get<{ url: string }>(
      `/documents/${documentId}/download-url`
    )
    return response.data.url
  },

  /**
   * Update collection state
   */
  async updateState(
    id: string,
    data: UpdateCollectionStateRequest
  ): Promise<Collection> {
    const response = await apiClient.patch<Collection>(
      `/collections/${id}/state`,
      data
    )
    return response.data
  },
}
