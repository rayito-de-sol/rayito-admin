/**
 * Package types for Rayito Admin
 * Reusable packaging entities with cost tracking
 */

/**
 * Package cost record
 */
export interface PackageCost {
  id: string
  package_id: string
  amount: number
  status: 'active' | 'superseded'
  created_at: string
}

/**
 * Package entity
 */
export interface Package {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  // Additional fields from API
  current_cost?: number
  usage_count?: number
}

/**
 * Request body for creating a package
 */
export interface CreatePackageRequest {
  name: string
  description?: string
  initial_cost: number
}

/**
 * Request body for updating a package
 */
export interface UpdatePackageRequest {
  name?: string
  description?: string
}
