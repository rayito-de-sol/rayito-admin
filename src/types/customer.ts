/**
 * Tipos de clientes
 * Corresponden al modelo de dominio del backend: personas (venta al detal) y
 * tiendas (venta al por mayor, facturadas con cuenta de cobro).
 */

export type CustomerType = 'person' | 'store'

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  person: 'Persona',
  store: 'Tienda',
}

/**
 * Dirección física
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
 * Configuración del documento de cobro. Solo las tiendas la tienen.
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
 * Cliente. Para las personas solo el nombre es obligatorio; el resto de campos
 * pertenece a las tiendas y llega vacío o ausente.
 */
export interface Customer {
  id: string
  type: CustomerType
  name: string
  identity_number?: string
  legal_name?: string
  identity_type?: string
  address_id?: string
  address?: Address
  contact_phone_number?: string
  contact_person_name?: string
  contact_person_email?: string
  discount_percentage: number
  deduct_vat: boolean
  config_id?: string
  collection_doc_config?: CollectionDocConfig
  created_at: string
  updated_at: string
}

/**
 * Cuerpo para crear un cliente. Es plano: la dirección y la configuración del
 * documento de cobro van al mismo nivel, igual que en la actualización.
 */
export interface CreateCustomerRequest {
  type: CustomerType
  name: string

  // Identidad (obligatoria para tiendas)
  identity_number?: string
  legal_name?: string
  identity_type?: string

  // Dirección (obligatoria para tiendas)
  line1?: string
  line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string

  // Contacto
  contact_phone_number?: string
  contact_person_name?: string
  contact_person_email?: string

  // Configuración comercial
  discount_percentage?: number
  deduct_vat?: boolean

  // Configuración del documento de cobro
  include_products_detail?: boolean
  include_unit_value?: boolean
  include_sku_in_detail?: boolean
  detail_in_appendix?: boolean
  include_legal_income_note?: boolean
}

/**
 * Actualización parcial. El tipo de cliente no se puede cambiar.
 */
export type UpdateCustomerRequest = Partial<Omit<CreateCustomerRequest, 'type'>>

/**
 * Error por fila devuelto por la importación masiva
 */
export interface BulkImportRowError {
  row: number
  identity_number: string
  error: string
}

/**
 * Resumen devuelto tras una importación masiva de clientes
 */
export interface BulkImportResult {
  total: number
  created: number
  failed: number
  errors: BulkImportRowError[]
}
