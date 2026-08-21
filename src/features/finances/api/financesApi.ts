import { apiClient } from '@/services/api/client'
import type {
  BalanceItem,
  BalanceItemRequest,
  BalanceSheet,
  BulkCreateResult,
  CashFlow,
  CreateExpenseRequest,
  Expense,
  ExpenseFilters,
  IncomeStatement,
} from '../types/finance.types'

/**
 * Finanzas API: gastos, ítems de balance y estados financieros
 */
export const financesApi = {
  async listExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
    const params = new URLSearchParams()
    if (filters?.from) params.append('from', filters.from)
    if (filters?.to) params.append('to', filters.to)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.classification)
      params.append('classification', filters.classification)

    const queryString = params.toString()
    const url = queryString ? `/expenses?${queryString}` : '/expenses'
    const response = await apiClient.get<Expense[]>(url)
    return response.data
  },

  async createExpense(data: CreateExpenseRequest): Promise<Expense> {
    const response = await apiClient.post<Expense>('/expenses', data)
    return response.data
  },

  async bulkCreateExpenses(
    expenses: CreateExpenseRequest[]
  ): Promise<BulkCreateResult> {
    const response = await apiClient.post<BulkCreateResult>('/expenses/bulk', {
      expenses,
    })
    return response.data
  },

  async updateExpense(
    id: string,
    data: CreateExpenseRequest
  ): Promise<Expense> {
    const response = await apiClient.put<Expense>(`/expenses/${id}`, data)
    return response.data
  },

  async deleteExpense(id: string): Promise<void> {
    await apiClient.delete(`/expenses/${id}`)
  },

  async listBalanceItems(): Promise<BalanceItem[]> {
    const response = await apiClient.get<BalanceItem[]>('/balance-items')
    return response.data
  },

  async createBalanceItem(data: BalanceItemRequest): Promise<BalanceItem> {
    const response = await apiClient.post<BalanceItem>('/balance-items', data)
    return response.data
  },

  async updateBalanceItem(
    id: string,
    data: BalanceItemRequest
  ): Promise<BalanceItem> {
    const response = await apiClient.put<BalanceItem>(
      `/balance-items/${id}`,
      data
    )
    return response.data
  },

  async deleteBalanceItem(id: string): Promise<void> {
    await apiClient.delete(`/balance-items/${id}`)
  },

  async getIncomeStatement(from: string, to: string): Promise<IncomeStatement> {
    const response = await apiClient.get<IncomeStatement>(
      `/finance/income-statement?from=${from}&to=${to}`
    )
    return response.data
  },

  async getCashFlow(from: string, to: string): Promise<CashFlow> {
    const response = await apiClient.get<CashFlow>(
      `/finance/cash-flow?from=${from}&to=${to}`
    )
    return response.data
  },

  async getBalanceSheet(): Promise<BalanceSheet> {
    const response = await apiClient.get<BalanceSheet>('/finance/balance-sheet')
    return response.data
  },
}
