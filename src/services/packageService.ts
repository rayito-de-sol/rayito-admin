import { apiClient } from './api/client'
import type {
  Package,
  CreatePackageRequest,
  UpdatePackageRequest,
  PackageCost,
} from '@/types/package'
import { AxiosError } from 'axios'

/**
 * Map API error codes to Spanish error messages
 */
const getPackageErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const errorCode = error.response?.data?.code

    if (status === 404 || errorCode === 'PACKAGE_NOT_FOUND') {
      return 'Empaque no encontrado'
    }

    if (status === 409 || errorCode === 'PACKAGE_IN_USE') {
      return 'No se puede eliminar el empaque porque está en uso por uno o más productos'
    }

    if (status === 409 || errorCode === 'DUPLICATE_PACKAGE_NAME') {
      return 'Ya existe un empaque con este nombre'
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
 * Package service
 * Handles all package CRUD operations, cost, and cost history
 */
export const packageService = {
  /**
   * List all packages
   * @returns Array of packages
   */
  async listPackages(): Promise<Package[]> {
    try {
      const response = await apiClient.get<Package[]>('/packages')
      return response.data
    } catch (error) {
      const message = getPackageErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Get package by ID
   * @param id Package UUID
   * @returns Package object
   */
  async getPackage(id: string): Promise<Package> {
    try {
      const response = await apiClient.get<Package>(`/packages/${id}`)
      return response.data
    } catch (error) {
      const message = getPackageErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Create new package
   * @param data Package creation data
   * @returns Created package
   */
  async createPackage(data: CreatePackageRequest): Promise<Package> {
    try {
      const response = await apiClient.post<Package>('/packages', data)
      return response.data
    } catch (error) {
      const message = getPackageErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Update existing package
   * @param id Package UUID
   * @param data Partial update data
   * @returns Updated package
   */
  async updatePackage(
    id: string,
    data: UpdatePackageRequest
  ): Promise<Package> {
    try {
      const response = await apiClient.put<Package>(`/packages/${id}`, data)
      return response.data
    } catch (error) {
      const message = getPackageErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Update package cost (creates new cost record)
   * @param id Package UUID
   * @param amount New cost amount
   * @returns Updated package
   */
  async updateCost(id: string, amount: number): Promise<Package> {
    try {
      const response = await apiClient.patch<Package>(`/packages/${id}/cost`, {
        amount,
      })
      return response.data
    } catch (error) {
      const message = getPackageErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Get package cost history
   * @param id Package UUID
   * @returns Array of cost records
   */
  async getCostHistory(id: string): Promise<PackageCost[]> {
    try {
      const response = await apiClient.get<PackageCost[]>(
        `/packages/${id}/cost-history`
      )
      return response.data
    } catch (error) {
      const message = getPackageErrorMessage(error)
      throw new Error(message)
    }
  },
}
