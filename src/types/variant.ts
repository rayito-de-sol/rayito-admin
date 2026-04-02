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
  product_id: string
  color: string
  size_id: string
  sku: string
  stock: number
  images: VariantImage[]
  created_at: string
  updated_at: string
  // Nested relations (if included in API response)
  size?: {
    id: string
    label: string
  }
  current_cost?: number
  product_name?: string // Populated when listing all variants
}

/**
 * Request body for creating a variant
 */
export interface CreateVariantRequest {
  color: string
  size_id: string
  sku: string
  stock: number
  initial_cost: number
  images?: VariantImage[]
}
