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
  customer_id?: string
  /** Nombre guardado al registrar la venta; también cubre pedidos históricos sin cliente */
  customer_name?: string
  customer_phone?: string
  notes?: string
  subtotal: number
  taxes: number
  total: number
  currency: string
  order_date: string
  /** Pagado si tiene valor; un pedido confirmado sin él es una cuenta por cobrar */
  paid_at?: string
  /** Fecha de vencimiento (YYYY-MM-DD) de los pedidos por cobrar */
  payment_due_date?: string
  /** Cuenta de cobro que factura el pedido (solo ventas a tiendas) */
  collection_id?: string
  collection_document_id?: string
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
  customer_id: string
  source: OrderSource
  /** Pagado de contado. Por defecto sí para personas, no para tiendas */
  paid: boolean
  /** Obligatoria cuando el pedido no está pagado (YYYY-MM-DD) */
  payment_due_date?: string
  notes?: string
  items: CreateOrderItemRequest[]
}

// Igual que crear pero sin `paid` (el pago se registra desde la lista) y con
// items opcional: si se omite, el backend conserva los artículos y totales
// existentes (pedidos históricos sin variante)
export interface UpdateOrderRequest {
  customer_id: string
  source: OrderSource
  payment_due_date?: string
  notes?: string
  items?: CreateOrderItemRequest[]
}

/** Respuesta de creación: el pedido y, si falló el PDF de la cuenta de cobro, un aviso */
export interface CreateOrderResult {
  order: Order
  warning?: string
}

export interface PayOrderRequest {
  payment_method?: string
  payment_reference?: string
}

export interface CancelOrderRequest {
  cancel_reason?: string
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

/** Un pedido está pagado cuando tiene fecha de pago */
export const isOrderPaid = (order: Order): boolean => !!order.paid_at

/**
 * Los pedidos facturados con cuenta de cobro no se editan ni se eliminan:
 * el documento ya salió hacia la tienda.
 */
export const isOrderLocked = (order: Order): boolean =>
  !!order.collection_id || order.source === 'store'
