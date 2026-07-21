import { useCallback, useEffect, useState } from 'react'
import { financesApi } from '../api/financesApi'
import type { Expense, ExpenseCategory } from '../types/finance.types'

/**
 * Hook para cargar gastos, con filtro opcional por categoría.
 */
export const useExpenses = (category: ExpenseCategory | 'all') => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await financesApi.listExpenses(
        category === 'all' ? undefined : { category }
      )
      setExpenses(data)
    } catch (err) {
      console.error('Error cargando gastos:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar gastos')
    } finally {
      setIsLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  return { expenses, isLoading, error, refetch: fetchExpenses }
}
