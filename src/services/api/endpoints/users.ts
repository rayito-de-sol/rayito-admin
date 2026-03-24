import { apiClient } from '../client'
import type { User } from '@/types/user'

/**
 * User API endpoints
 */

export const usersApi = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/users/me')
    return response.data
  },

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`)
    return response.data
  },

  /**
   * Get all users (admin only)
   */
  async getAll(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users')
    return response.data
  },

  /**
   * Update user profile
   */
  async updateProfile(
    id: string,
    data: Partial<Pick<User, 'fullName'>>
  ): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}`, data)
    return response.data
  },
}
