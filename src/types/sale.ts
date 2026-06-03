export type SaleSource = 'store' | 'shopify' | 'whatsapp'
export type SaleState = 'pending' | 'confirmed' | 'cancelled'

export interface SaleItem {
  id: string
  sale_id: string
  variant_id?: string
  product_name: string
  variant_color: string
  variant_sku: string
  size_name?: string
  unit_price: number
  quantity: number
}

export interface Sale {
  id: string
  source: SaleSource
  external_id?: string
  state: SaleState
  store_id?: string
  customer_name?: string
  customer_phone?: string
  notes?: string
  subtotal: number
  taxes: number
  total: number
  currency: string
  sale_date: string
  created_by?: string
  created_at: string
  updated_at: string
  items?: SaleItem[]
}

export interface SourceSummary {
  revenue: number
  orders: number
}

export interface MonthlySummary {
  year: number
  month: number
  revenue: number
  orders: number
}

export interface SalesSummary {
  total_revenue: number
  total_orders: number
  by_source: Record<SaleSource, SourceSummary>
  by_month: MonthlySummary[]
}

export interface CreateSaleItemRequest {
  variant_id: string
  quantity: number
}

export interface CreateSaleRequest {
  source: SaleSource
  store_id?: string
  customer_name?: string
  customer_phone?: string
  notes?: string
  items: CreateSaleItemRequest[]
}

export const SALE_SOURCE_LABELS: Record<SaleSource, string> = {
  store: 'Tienda',
  shopify: 'Shopify',
  whatsapp: 'WhatsApp',
}

export const SALE_STATE_LABELS: Record<SaleState, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
}
