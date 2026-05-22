import { apiClient } from '@/services/api/client'
import type {
  Collection,
  CreateCollectionRequest,
  UpdateCollectionItemsRequest,
  UpdateCollectionMetadataRequest,
  UpdateCollectionStateRequest,
  CollectionFilters,
} from '../types/collection.types'

/**
 * Collections API endpoints
 */
export const collectionsApi = {
  /**
   * List collections with optional filters
   */
  async list(filters?: CollectionFilters): Promise<Collection[]> {
    const params = new URLSearchParams()

    if (filters?.store_id) {
      params.append('store_id', filters.store_id)
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
   * Create a new collection (draft state)
   */
  async create(data: CreateCollectionRequest): Promise<Collection> {
    const response = await apiClient.post<Collection>('/collections', data)
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
   * Update collection items (draft only)
   */
  async updateItems(
    id: string,
    data: UpdateCollectionItemsRequest
  ): Promise<Collection> {
    const response = await apiClient.put<Collection>(
      `/collections/${id}/items`,
      data
    )
    return response.data
  },

  /**
   * Update collection metadata (draft only)
   */
  async updateMetadata(
    id: string,
    data: UpdateCollectionMetadataRequest
  ): Promise<Collection> {
    const response = await apiClient.patch<Collection>(
      `/collections/${id}`,
      data
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
