import { apiClient } from './api/client'
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductPrice,
  SetCostResponse,
  SetStockResponse,
  ProductStatus,
  ProductCategory,
  ProductType,
  BulkImportProductResult,
} from '@/types/product'
import { AxiosError } from 'axios'

/**
 * Map API error codes to Spanish error messages
 */
const getProductErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const errorCode = error.response?.data?.code

    if (status === 404 || errorCode === 'PRODUCT_NOT_FOUND') {
      return 'Producto no encontrado'
    }

    if (status === 409 || errorCode === 'DUPLICATE_SLUG') {
      return 'Ya existe un producto con este slug'
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
 * Product service
 * Handles all product CRUD operations, pricing, and set computations
 */
export const productService = {
  /**
   * List all products with optional filters
   * @param filters Optional filters for status, category, type
   * @returns Array of products
   */
  async listProducts(filters?: {
    status?: ProductStatus
    category?: ProductCategory
    type?: ProductType
  }): Promise<Product[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.category) params.append('category', filters.category)
      if (filters?.type) params.append('type', filters.type)

      const queryString = params.toString()
      const url = queryString ? `/products?${queryString}` : '/products'

      const response = await apiClient.get<Product[]>(url)
      return response.data
    } catch (error) {
      const message = getProductErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Get product by ID
   * @param id Product UUID
   * @returns Product object with nested data
   */
  async getProduct(id: string): Promise<Product> {
    try {
      const response = await apiClient.get<Product>(`/products/${id}`)
      return response.data
    } catch (error) {
      const message = getProductErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Create new product
   * @param data Product creation data
   * @returns Created product
   */
  async createProduct(data: CreateProductRequest): Promise<Product> {
    try {
      const response = await apiClient.post<Product>('/products', data)
      return response.data
    } catch (error) {
      const message = getProductErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Update existing product
   * @param id Product UUID
   * @param data Partial update data
   * @returns Updated product
   */
  async updateProduct(
    id: string,
    data: UpdateProductRequest
  ): Promise<Product> {
    try {
      const response = await apiClient.put<Product>(`/products/${id}`, data)
      return response.data
    } catch (error) {
      const message = getProductErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Update product status
   * @param id Product UUID
   * @param status New status
   * @returns Updated product
   */
  async updateStatus(id: string, status: ProductStatus): Promise<Product> {
    try {
      const response = await apiClient.patch<Product>(
        `/products/${id}/status`,
        {
          status,
        }
      )
      return response.data
    } catch (error) {
      const message = getProductErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Update product price (creates new price record)
   * @param id Product UUID
   * @param amount New price amount
   * @returns Updated product
   */
  async updatePrice(id: string, amount: number): Promise<Product> {
    try {
      const response = await apiClient.patch<Product>(`/products/${id}/price`, {
        amount,
      })
      return response.data
    } catch (error) {
      const message = getProductErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Get product price history
   * @param id Product UUID
   * @returns Array of price records
   */
  async getPriceHistory(id: string): Promise<ProductPrice[]> {
    try {
      const response = await apiClient.get<ProductPrice[]>(
        `/products/${id}/price-history`
      )
      return response.data
    } catch (error) {
      const message = getProductErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Get computed set cost
   * @param id Set product UUID
   * @returns Computed cost breakdown
   */
  async getSetCost(id: string): Promise<SetCostResponse> {
    try {
      const response = await apiClient.get<SetCostResponse>(
        `/products/${id}/set-cost`
      )
      return response.data
    } catch (error) {
      const message = getProductErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Get computed set stock
   * @param id Set product UUID
   * @returns Computed available stock
   */
  async getSetStock(id: string): Promise<SetStockResponse> {
    try {
      const response = await apiClient.get<SetStockResponse>(
        `/products/${id}/set-stock`
      )
      return response.data
    } catch (error) {
      const message = getProductErrorMessage(error)
      throw new Error(message)
    }
  },

  /**
   * Bulk create single-type products from CSV data
   * @param products Array of product inputs
   * @returns Import result with per-row errors
   */
  async bulkCreateProducts(
    products: {
      name: string
      slug: string
      sku_prefix: string
      description: string
      category: string
      tags: string
      initial_price: number
    }[]
  ): Promise<BulkImportProductResult> {
    try {
      const response = await apiClient.post<BulkImportProductResult>(
        '/products/bulk',
        products
      )
      return response.data
    } catch (error) {
      const message = getProductErrorMessage(error)
      throw new Error(message)
    }
  },
}
