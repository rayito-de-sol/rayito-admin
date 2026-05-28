/**
 * Store type definitions
 * Matches backend domain models for third-party stores
 */

/**
 * Address represents a physical address
 */
export interface Address {
  id: string
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  created_at: string
  updated_at: string
}

/**
 * CollectionDocConfig represents configuration for collection documents sent to stores
 */
export interface CollectionDocConfig {
  id: string
  include_products_detail: boolean
  include_unit_value: boolean
  include_sku_in_detail: boolean
  detail_in_appendix: boolean
  include_legal_income_note: boolean
  created_at: string
  updated_at: string
}

/**
 * Store represents a third-party store/client
 */
export interface Store {
  id: string
  identity_number: string
  name: string
  legal_name: string
  identity_type: string
  address_id: string
  address?: Address
  contact_phone_number: string
  contact_person_name: string
  contact_person_email: string
  discount_percentage: number
  deduct_vat: boolean
  config_id: string
  collection_doc_config?: CollectionDocConfig
  created_at: string
  updated_at: string
}

/**
 * CreateStoreRequest type for form submission
 */
export interface CreateStoreRequest {
  // Identity Information
  identity_number: string
  name: string
  legal_name: string
  identity_type: string

  // Address
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string

  // Contact Details
  contact_phone_number: string
  contact_person_name: string
  contact_person_email: string

  // Configuration
  discount_percentage: number
  deduct_vat: boolean

  // Collection Document Configuration
  include_products_detail: boolean
  include_unit_value: boolean
  include_sku_in_detail: boolean
  detail_in_appendix: boolean
  include_legal_income_note: boolean
}

/**
 * BulkImportRowError describes a per-row failure returned by the bulk create endpoint
 */
export interface BulkImportRowError {
  row: number
  identity_number: string
  error: string
}

/**
 * BulkImportResult is the summary returned after a bulk store import
 */
export interface BulkImportResult {
  total: number
  created: number
  failed: number
  errors: BulkImportRowError[]
}

/**
 * UpdateStoreRequest type for partial updates
 */
export interface UpdateStoreRequest {
  // Identity Information
  identity_number?: string
  name?: string
  legal_name?: string
  identity_type?: string

  // Address
  line1?: string
  line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string

  // Contact Details
  contact_phone_number?: string
  contact_person_name?: string
  contact_person_email?: string

  // Configuration
  discount_percentage?: number
  deduct_vat?: boolean

  // Collection Document Configuration
  include_products_detail?: boolean
  include_unit_value?: boolean
  include_sku_in_detail?: boolean
  detail_in_appendix?: boolean
  include_legal_income_note?: boolean
}
