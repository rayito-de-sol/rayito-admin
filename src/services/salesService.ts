import { apiClient } from './api/client'
import type {
  Sale,
  SalesSummary,
  CreateSaleRequest,
  SaleSource,
  SaleState,
} from '@/types/sale'
import { AxiosError } from 'axios'

const getSaleErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const errorCode = error.response?.data?.error?.code

    if (status === 404 || errorCode === 'SALE_NOT_FOUND') return 'Venta no encontrada'
    if (status === 400 || errorCode === 'VALIDATION_FAILED') {
      const msg = error.response?.data?.error?.message
      if (msg) return msg
      return 'Datos inválidos. Por favor, verifique los campos'
    }
    if (status === 403) return 'No tienes permisos para realizar esta operación'
    if (status === 500) return 'Error del servidor. Por favor, intenta de nuevo más tarde'
    return error.message || 'Error desconocido'
  }
  if (error instanceof Error) return error.message
  return 'Error desconocido'
}

export interface SaleFilters {
  source?: SaleSource
  state?: SaleState
  store_id?: string
  from?: string
  to?: string
}

export const salesService = {
  async listSales(filters: SaleFilters = {}, signal?: AbortSignal): Promise<Sale[]> {
    try {
      const params = new URLSearchParams()
      if (filters.source) params.set('source', filters.source)
      if (filters.state) params.set('state', filters.state)
      if (filters.store_id) params.set('store_id', filters.store_id)
      if (filters.from) params.set('from', filters.from)
      if (filters.to) params.set('to', filters.to)

      const query = params.toString() ? `?${params.toString()}` : ''
      const res = await apiClient.get<Sale[]>(`/sales${query}`, { signal })
      return res.data
    } catch (error) {
      if (error instanceof AxiosError && error.code === 'ERR_CANCELED') throw error
      throw new Error(getSaleErrorMessage(error))
    }
  },

  async getSalesSummary(from?: string, to?: string, signal?: AbortSignal): Promise<SalesSummary> {
    try {
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      const query = params.toString() ? `?${params.toString()}` : ''
      const res = await apiClient.get<SalesSummary>(`/sales/summary${query}`, { signal })
      return res.data
    } catch (error) {
      if (error instanceof AxiosError && error.code === 'ERR_CANCELED') throw error
      throw new Error(getSaleErrorMessage(error))
    }
  },

  async createSale(data: CreateSaleRequest): Promise<Sale> {
    try {
      const res = await apiClient.post<Sale>('/sales', data)
      return res.data
    } catch (error) {
      throw new Error(getSaleErrorMessage(error))
    }
  },
}
