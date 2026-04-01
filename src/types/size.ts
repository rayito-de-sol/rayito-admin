/**
 * Size types for Rayito Admin
 * Product-specific sizes (e.g., "Niña", "Adulto", "4cm")
 */

/**
 * Size entity
 */
export interface Size {
  id: string
  product_id: string
  label: string
  created_at: string
  updated_at: string
}

/**
 * Request body for creating a size
 */
export interface CreateSizeRequest {
  label: string
}
