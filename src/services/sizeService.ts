import { apiClient } from './api/client'
import type { Size, CreateSizeRequest, UpdateSizeRequest } from '@/types/size'
import { AxiosError } from 'axios'

const getSizeErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const errorCode = error.response?.data?.code

    if (status === 409 || errorCode === 'DUPLICATE_SIZE_LABEL') {
      return 'Ya existe una talla con esta etiqueta'
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

export const sizeService = {
  async listSizes(): Promise<Size[]> {
    try {
      const response = await apiClient.get<Size[]>('/sizes')
      return response.data
    } catch (error) {
      const message = getSizeErrorMessage(error)
      throw new Error(message)
    }
  },

  async createSize(data: CreateSizeRequest): Promise<Size> {
    try {
      const response = await apiClient.post<Size>('/sizes', data)
      return response.data
    } catch (error) {
      const message = getSizeErrorMessage(error)
      throw new Error(message)
    }
  },

  async updateSize(id: string, data: UpdateSizeRequest): Promise<Size> {
    try {
      const response = await apiClient.put<Size>(`/sizes/${id}`, data)
      return response.data
    } catch (error) {
      const message = getSizeErrorMessage(error)
      throw new Error(message)
    }
  },

  async deleteSize(id: string): Promise<void> {
    try {
      await apiClient.delete(`/sizes/${id}`)
    } catch (error) {
      const message = getSizeErrorMessage(error)
      throw new Error(message)
    }
  },
}
