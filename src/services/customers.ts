import { apiClient } from './api/client'
import type {
  Customer,
  CustomerType,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  BulkImportResult,
} from '@/types/customer'
import { AxiosError } from 'axios'

/**
 * Servicio de clientes
 * Cubre personas y tiendas: ambas viven en el mismo endpoint y se distinguen
 * por el campo `type`.
 */

/**
 * Traduce los códigos de error del API a mensajes en español
 */
const getCustomerErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const errorCode = error.response?.data?.error?.code

    if (status === 409 || errorCode === 'DUPLICATE_IDENTITY') {
      return 'Ya existe un cliente con este número de identificación'
    }

    if (status === 404 || errorCode === 'CUSTOMER_NOT_FOUND') {
      return 'Cliente no encontrado'
    }

    if (status === 403) {
      return 'No tienes permisos para realizar esta operación'
    }

    if (status === 400 || errorCode === 'VALIDATION_FAILED') {
      const backendMessage = error.response?.data?.error?.message
      if (backendMessage) return backendMessage
      return 'Datos inválidos. Por favor, verifique los campos'
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

export const customersService = {
  /**
   * Lista los clientes, opcionalmente filtrados por tipo
   */
  async listCustomers(type?: CustomerType, signal?: AbortSignal): Promise<Customer[]> {
    try {
      const response = await apiClient.get<Customer[]>('/customers', {
        params: type ? { type } : undefined,
        signal,
      })
      return response.data
    } catch (error) {
      throw new Error(getCustomerErrorMessage(error))
    }
  },

  /**
   * Obtiene un cliente con su dirección y configuración
   */
  async getCustomer(id: string): Promise<Customer> {
    try {
      const response = await apiClient.get<Customer>(`/customers/${id}`)
      return response.data
    } catch (error) {
      throw new Error(getCustomerErrorMessage(error))
    }
  },

  /**
   * Crea un cliente (persona o tienda)
   */
  async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
    try {
      const response = await apiClient.post<Customer>('/customers', data)
      return response.data
    } catch (error) {
      throw new Error(getCustomerErrorMessage(error))
    }
  },

  /**
   * Actualiza un cliente con los campos que cambiaron
   */
  async updateCustomer(id: string, data: UpdateCustomerRequest): Promise<Customer> {
    try {
      const response = await apiClient.patch<Customer>(`/customers/${id}`, data)
      return response.data
    } catch (error) {
      throw new Error(getCustomerErrorMessage(error))
    }
  },

  /**
   * Crea clientes en bloque a partir de un CSV ya parseado
   */
  async bulkCreateCustomers(customers: CreateCustomerRequest[]): Promise<BulkImportResult> {
    try {
      const response = await apiClient.post<BulkImportResult>('/customers/bulk', customers)
      return response.data
    } catch (error) {
      throw new Error(getCustomerErrorMessage(error))
    }
  },
}
