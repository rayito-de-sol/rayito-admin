import { apiClient } from './api/client'
import { AxiosError } from 'axios'

const getShopifyErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const msg = error.response?.data?.error?.message
    if (msg) return msg
    if (error.response?.status === 403) return 'No tienes permisos para realizar esta operación'
    return error.message || 'Error desconocido'
  }
  if (error instanceof Error) return error.message
  return 'Error desconocido'
}

export interface ShopifySyncResult {
  synced: number
  skipped: number
}

export interface ShopifySetupResult {
  registered: string[]
  already_existed: string[]
}

export const shopifyService = {
  async triggerSync(): Promise<ShopifySyncResult> {
    try {
      const res = await apiClient.post<ShopifySyncResult>('/shopify/sync')
      return res.data
    } catch (error) {
      throw new Error(getShopifyErrorMessage(error))
    }
  },

  async setup(): Promise<ShopifySetupResult> {
    try {
      const res = await apiClient.post<ShopifySetupResult>('/shopify/setup')
      return res.data
    } catch (error) {
      throw new Error(getShopifyErrorMessage(error))
    }
  },
}
