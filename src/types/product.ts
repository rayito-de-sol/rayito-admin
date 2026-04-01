/**
 * Product types for Rayito Admin
 * Colombian hair accessories catalog
 */

/**
 * Product categories
 */
export enum ProductCategory {
  SET = 'set',
  TURBANTE = 'turbante',
  CINTILLO = 'cintillo',
  PINZA = 'pinza',
  MAXIMONO = 'maximono',
  MONO = 'mono',
  DIADEMA = 'diadema',
  OTRO = 'otro',
}

/**
 * Product types
 */
export enum ProductType {
  SINGLE = 'single',
  SET = 'set',
}

/**
 * Product status
 */
export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

/**
 * Product entity
 */
export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  sku_prefix: string
  category: ProductCategory
  type: ProductType
  status: ProductStatus
  tags: string[]
  package_id: string | null
  created_at: string
  updated_at: string
  // Nested relations (if included in API response)
  package?: {
    id: string
    name: string
    current_cost: number
  }
  current_price?: number
  variants?: any[] // Will be properly typed when Variant type is available
  sizes?: any[] // Will be properly typed when Size type is available
}

/**
 * Request body for creating a product
 */
export interface CreateProductRequest {
  name: string
  slug: string
  description?: string
  sku_prefix: string
  category: ProductCategory
  type: ProductType
  tags?: string[]
  package_id?: string | null
  initial_price: number
}

/**
 * Request body for updating a product
 */
export interface UpdateProductRequest {
  name?: string
  slug?: string
  description?: string
  category?: ProductCategory
  tags?: string[]
  status?: ProductStatus
  package_id?: string | null
}

/**
 * Response for set product cost computation
 */
export interface SetCostResponse {
  total_cost: number
  component_cost: number
  package_cost: number
}

/**
 * Response for set product stock computation
 */
export interface SetStockResponse {
  available_stock: number
}

/**
 * Price record
 */
export interface ProductPrice {
  id: string
  product_id: string
  amount: number
  effective_date: string
  superseded_at: string | null
  created_at: string
}
