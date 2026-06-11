export interface Color {
  id: string
  name: string
  sku: string
  created_at: string
  updated_at: string
}

export interface CreateColorRequest {
  name: string
  sku: string
}

export interface UpdateColorRequest {
  name: string
  sku: string
}
