export type OrderSource = 'store' | 'shopify' | 'whatsapp'
export type OrderState = 'pending' | 'confirmed' | 'cancelled'

export interface OrderItem {
  id: string
  order_id: string
  variant_id?: string
  product_name: string
  variant_color: string
  variant_sku: string
  size_name?: string
  unit_price: number
  quantity: number
}

export interface Order {
  id: string
  source: OrderSource
  external_id?: string
  state: OrderState
  store_id?: string
  customer_name?: string
  customer_phone?: string
  notes?: string
  subtotal: number
  taxes: number
  total: number
  currency: string
  order_date: string
  created_by?: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
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

export interface OrdersSummary {
  total_revenue: number
  total_orders: number
  by_source: Record<OrderSource, SourceSummary>
  by_month: MonthlySummary[]
}

export interface CreateOrderItemRequest {
  variant_id: string
  quantity: number
}

export interface CreateOrderRequest {
  source: OrderSource
  store_id?: string
  customer_name?: string
  customer_phone?: string
  notes?: string
  items: CreateOrderItemRequest[]
}

export const ORDER_SOURCE_LABELS: Record<OrderSource, string> = {
  store: 'Tienda',
  shopify: 'Shopify',
  whatsapp: 'WhatsApp',
}

export const ORDER_STATE_LABELS: Record<OrderState, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
}
