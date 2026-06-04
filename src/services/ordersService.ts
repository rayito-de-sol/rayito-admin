import { apiClient } from './api/client'
import type {
  Order,
  OrdersSummary,
  CreateOrderRequest,
  OrderSource,
  OrderState,
} from '@/types/order'
import { AxiosError } from 'axios'

const getOrderErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const errorCode = error.response?.data?.error?.code

    if (status === 404 || errorCode === 'ORDER_NOT_FOUND') return 'Pedido no encontrado'
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

export interface OrderFilters {
  source?: OrderSource
  state?: OrderState
  store_id?: string
  from?: string
  to?: string
}

export const ordersService = {
  async listOrders(filters: OrderFilters = {}, signal?: AbortSignal): Promise<Order[]> {
    try {
      const params = new URLSearchParams()
      if (filters.source) params.set('source', filters.source)
      if (filters.state) params.set('state', filters.state)
      if (filters.store_id) params.set('store_id', filters.store_id)
      if (filters.from) params.set('from', filters.from)
      if (filters.to) params.set('to', filters.to)

      const query = params.toString() ? `?${params.toString()}` : ''
      const res = await apiClient.get<Order[]>(`/orders${query}`, { signal })
      return res.data
    } catch (error) {
      if (error instanceof AxiosError && error.code === 'ERR_CANCELED') throw error
      throw new Error(getOrderErrorMessage(error))
    }
  },

  async getOrdersSummary(from?: string, to?: string, signal?: AbortSignal): Promise<OrdersSummary> {
    try {
      const params = new URLSearchParams()
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      const query = params.toString() ? `?${params.toString()}` : ''
      const res = await apiClient.get<OrdersSummary>(`/orders/summary${query}`, { signal })
      return res.data
    } catch (error) {
      if (error instanceof AxiosError && error.code === 'ERR_CANCELED') throw error
      throw new Error(getOrderErrorMessage(error))
    }
  },

  async createOrder(data: CreateOrderRequest): Promise<Order> {
    try {
      const res = await apiClient.post<Order>('/orders', data)
      return res.data
    } catch (error) {
      throw new Error(getOrderErrorMessage(error))
    }
  },
}
