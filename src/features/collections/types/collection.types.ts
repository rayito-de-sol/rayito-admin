// Collection state types
export type CollectionState = 'draft' | 'active' | 'paid' | 'cancelled';

// Main collection interface
export interface Collection {
  id: string;
  collection_number: number;
  customer_id: string;
  /** Pedido que factura esta cuenta de cobro */
  order_id?: string;

  // Pricing
  subtotal_before_discount: number;
  discount_percentage: number;
  discount_amount: number;
  subtotal_after_discount: number;
  vat_deducted: boolean;
  vat_percentage: number;
  vat_amount: number;
  total_price: number;
  currency: string;

  // State
  state: CollectionState;

  // Optional metadata
  payment_due_date?: string;
  payment_received_at?: string;
  payment_method?: string;
  payment_reference?: string;
  document_id?: string;
  notes?: string;

  // Audit
  created_at: string;
  created_by: string;
  updated_at: string;
  finalized_at?: string;
  finalized_by?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancel_reason?: string;

  // Relations
  items?: CollectionItem[];
}

// Collection item interface
export interface CollectionItem {
  id: string;
  collection_id: string;
  variant_id: string;

  // Snapshot data
  product_name: string;
  variant_color: string;
  variant_sku: string;
  size_name?: string;

  // Pricing
  unit_price_original: number;
  quantity: number;
  discount_applied: number;
  unit_price_final: number;
}

// API request types
export interface UpdateCollectionMetadataRequest {
  notes?: string;
  payment_due_date?: string;
}

export interface UpdateCollectionStateRequest {
  state: CollectionState;
  payment_method?: string;
  payment_reference?: string;
  cancel_reason?: string;
}

// Filters
export interface CollectionFilters {
  customer_id?: string;
  state?: CollectionState;
  from_date?: string;
  to_date?: string;
}
