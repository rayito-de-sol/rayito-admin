import { apiClient } from './api/client'
import type { Color, CreateColorRequest, UpdateColorRequest } from '@/types/color'

export const colorService = {
  async listColors(): Promise<Color[]> {
    const response = await apiClient.get<Color[]>('/colors')
    return response.data
  },

  async createColor(data: CreateColorRequest): Promise<Color> {
    const response = await apiClient.post<Color>('/colors', data)
    return response.data
  },

  async updateColor(id: string, data: UpdateColorRequest): Promise<Color> {
    const response = await apiClient.put<Color>(`/colors/${id}`, data)
    return response.data
  },

  async deleteColor(id: string): Promise<void> {
    await apiClient.delete(`/colors/${id}`)
  },
}
