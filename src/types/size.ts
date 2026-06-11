export interface Size {
  id: string
  label: string
  sku?: string
  created_at: string
  updated_at: string
}

export interface CreateSizeRequest {
  label: string
  sku?: string
}

export interface UpdateSizeRequest {
  label: string
  sku?: string
}
