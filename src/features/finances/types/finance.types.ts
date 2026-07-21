export type ExpenseCategory =
  | 'materiales'
  | 'nomina'
  | 'arriendo'
  | 'servicios'
  | 'transporte'
  | 'marketing'
  | 'otros'

export type ExpensePaymentMethod = 'efectivo' | 'transferencia' | 'otro'

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'materiales',
  'nomina',
  'arriendo',
  'servicios',
  'transporte',
  'marketing',
  'otros',
]

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  materiales: 'Materiales',
  nomina: 'Nómina',
  arriendo: 'Arriendo',
  servicios: 'Servicios',
  transporte: 'Transporte',
  marketing: 'Marketing',
  otros: 'Otros',
}

export const PAYMENT_METHOD_LABELS: Record<ExpensePaymentMethod, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  otro: 'Otro',
}

export interface Expense {
  id: string
  expense_date: string
  category: ExpenseCategory
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
  description: string
  amount: number
  payment_method?: ExpensePaymentMethod
  notes?: string
}

export interface ExpenseFilters {
  from?: string
  to?: string
  category?: ExpenseCategory
}

export interface BulkRowError {
  row: number
  error: string
}

export interface BulkCreateResult {
  created: number
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

export interface IncomeStatementMonth {
  year: number
  month: number
  revenue: number
  cogs: number
  gross_profit: number
  expenses_by_category: Record<string, number>
  total_expenses: number
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
