/**
 * Variant types for Rayito Admin
 * Product variants with color, size, SKU, stock, cost, and images
 */

/**
 * Variant image
 */
export interface VariantImage {
  url: string
  alt: string
  is_primary: boolean
}

/**
 * Variant cost record
 */
export interface VariantCost {
  id: string
  variant_id: string
  amount: number
  status: 'active' | 'superseded'
  created_at: string
}

/**
 * Variant entity
 */
export interface Variant {
  id: string
  product_id?: string
  color_id: string
  size_id?: string
  stock: number
  images: VariantImage[]
  status: string
  created_at: string
  updated_at: string
  // Nested relations (if included in API response)
  color?: {
    id: string
    name: string
    sku: string
  }
  size?: {
    id: string
    label: string
    sku?: string
  }
  current_cost?: number
  product_name?: string
  product_sku_prefix?: string
  product_price?: number
}

/**
 * Request body for creating a variant (product-scoped)
 */
export interface CreateVariantRequest {
  color_id: string
  size_id?: string
  stock: number
  initial_cost: number
  images?: VariantImage[]
}

/**
 * Single row in a bulk variant creation request
 */
export interface BulkVariantInput {
  color_id: string
  size_id?: string
  stock: number
  initial_cost: number
  product_id?: string
}

/**
 * Request body for bulk variant creation
 */
export interface BulkCreateVariantsRequest {
  variants: BulkVariantInput[]
}
