import { useCallback, useEffect, useState } from 'react'
import { financesApi } from '../api/financesApi'
import type {
  Expense,
  ExpenseCategory,
  ExpenseClassification,
  ExpenseFilters,
} from '../types/finance.types'

/**
 * Hook para cargar gastos, con filtros opcionales por categoría, clasificación
 * y rango de fechas (YYYY-MM-DD, ambos extremos incluidos; '' = sin límite).
 */
export const useExpenses = (
  category: ExpenseCategory | 'all',
  classification: ExpenseClassification | 'all',
  from: string,
  to: string
) => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const filters: ExpenseFilters = {}
      if (category !== 'all') filters.category = category
      if (classification !== 'all') filters.classification = classification
      if (from) filters.from = from
      if (to) filters.to = to
      const data = await financesApi.listExpenses(
        Object.keys(filters).length > 0 ? filters : undefined
      )
      setExpenses(data)
    } catch (err) {
      console.error('Error cargando gastos:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar gastos')
    } finally {
      setIsLoading(false)
    }
  }, [category, classification, from, to])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  return { expenses, isLoading, error, refetch: fetchExpenses }
}
