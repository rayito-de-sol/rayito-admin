export type ExpenseCategory =
  | 'materiales'
  | 'nomina'
  | 'arriendo'
  | 'servicios'
  | 'transporte'
  | 'marketing'
  | 'pauta'
  | 'envios'
  | 'bancos'
  | 'otros'

export type ExpensePaymentMethod = 'efectivo' | 'transferencia' | 'otro'

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'materiales',
  'nomina',
  'arriendo',
  'servicios',
  'transporte',
  'marketing',
  'pauta',
  'envios',
  'bancos',
  'otros',
]

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  materiales: 'Materiales',
  nomina: 'Nómina',
  arriendo: 'Arriendo',
  servicios: 'Servicios',
  transporte: 'Transporte',
  marketing: 'Marketing',
  pauta: 'Pauta',
  envios: 'Envíos',
  bancos: 'Bancos',
  otros: 'Otros',
}

export const PAYMENT_METHOD_LABELS: Record<ExpensePaymentMethod, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  otro: 'Otro',
}

// Clasificación: producción alimenta el COGS del estado de resultados;
// administrativo y ventas son gastos operativos.
export type ExpenseClassification = 'produccion' | 'administrativo' | 'ventas'

export const EXPENSE_CLASSIFICATIONS: ExpenseClassification[] = [
  'produccion',
  'administrativo',
  'ventas',
]

export const EXPENSE_CLASSIFICATION_LABELS: Record<
  ExpenseClassification,
  string
> = {
  produccion: 'Producción',
  administrativo: 'Administrativo',
  ventas: 'Ventas',
}

// Preselección de clasificación al elegir categoría (solo conveniencia de UI;
// el campo siempre se envía explícito y el usuario puede cambiarlo)
export const DEFAULT_CLASSIFICATION_BY_CATEGORY: Record<
  ExpenseCategory,
  ExpenseClassification
> = {
  materiales: 'produccion',
  nomina: 'administrativo',
  arriendo: 'administrativo',
  servicios: 'administrativo',
  transporte: 'ventas',
  marketing: 'ventas',
  pauta: 'ventas',
  envios: 'ventas',
  bancos: 'administrativo',
  otros: 'administrativo',
}

export interface Expense {
  id: string
  expense_date: string
  category: ExpenseCategory
  classification: ExpenseClassification
  description: string
  amount: number
  payment_method?: ExpensePaymentMethod
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CreateExpenseRequest {
  expense_date: string // YYYY-MM-DD
  category: ExpenseCategory
  classification: ExpenseClassification
  description: string
  amount: number
  payment_method?: ExpensePaymentMethod
  notes?: string
}

export interface ExpenseFilters {
  from?: string
  to?: string
  category?: ExpenseCategory
  classification?: ExpenseClassification
}

export interface BulkRowError {
  row: number
  error: string
}

export interface BulkCreateResult {
  created: number
  // Filas (1-based) omitidas por repetir un gasto existente o una fila anterior
  skipped_rows: number[]
  errors: BulkRowError[]
}

export type BalanceItemType = 'asset' | 'liability'

export interface BalanceItem {
  id: string
  item_type: BalanceItemType
  name: string
  amount: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface BalanceItemRequest {
  item_type: BalanceItemType
  name: string
  amount: number
  notes?: string
}

export interface CategoryBreakdown {
  total: number
  by_category: Record<string, number>
}

export interface ExpenseBreakdown {
  total: number
  admin: CategoryBreakdown
  sales: CategoryBreakdown
}

export interface IncomeStatementMonth {
  year: number
  month: number
  revenue: number
  cogs: CategoryBreakdown
  gross_profit: number
  expenses: ExpenseBreakdown
  net_income: number
}

export interface IncomeStatement {
  from: string
  to: string
  months: IncomeStatementMonth[]
  totals: IncomeStatementMonth
}

export interface CashFlowMonth {
  year: number
  month: number
  sales_receipts: number
  collection_receipts: number
  total_in: number
  total_out: number
  net: number
  cumulative: number
}

export interface CashFlow {
  from: string
  to: string
  months: CashFlowMonth[]
  totals: CashFlowMonth
}

export interface BalanceSheet {
  inventory: number
  accounts_receivable: number
  manual_assets: BalanceItem[]
  total_assets: number
  liabilities: BalanceItem[]
  total_liabilities: number
  equity: number
  as_of: string
}
