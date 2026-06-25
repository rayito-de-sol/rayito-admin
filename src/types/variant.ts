/**
 * Variant types for Rayito Admin
 * Product variants with color, size, SKU, stock, and images
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
  product_name?: string
  product_sku?: string
  product_price?: number
}

/**
 * Request body for creating a variant (product-scoped)
 */
export interface CreateVariantRequest {
  color_id: string
  size_id?: string
  stock: number
  images?: VariantImage[]
}

/**
 * Single row in a bulk variant creation request
 */
export interface BulkVariantInput {
  color_id: string
  size_id?: string
  stock: number
  product_id?: string
}

/**
 * Request body for bulk variant creation
 */
export interface BulkCreateVariantsRequest {
  variants: BulkVariantInput[]
}
