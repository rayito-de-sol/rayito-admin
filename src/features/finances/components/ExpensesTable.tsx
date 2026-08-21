import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { SortableHead } from '@/components/SortableHead'
import { useSort } from '@/hooks/useSort'
import { formatCurrency } from '@/utils/currency'
import { ExpenseCategoryBadge } from './ExpenseCategoryBadge'
import { ExpenseClassificationBadge } from './ExpenseClassificationBadge'
import {
  PAYMENT_METHOD_LABELS,
  type Expense,
} from '../types/finance.types'
import { Pencil, Trash2 } from 'lucide-react'

interface ExpensesTableProps {
  expenses: Expense[]
  loading: boolean
  error: string | null
  canEdit: boolean
  onRetry: () => void
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
}

const formatExpenseDate = (dateString: string) => {
  // expense_date llega como fecha ISO; mostrar solo dd/mm/yyyy
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

/**
 * ExpensesTable
 * Lista de gastos con ordenamiento y acciones de edición/eliminación.
 */
export const ExpensesTable = ({
  expenses,
  loading,
  error,
  canEdit,
  onRetry,
  onEdit,
  onDelete,
}: ExpensesTableProps) => {
  const { sorted, sortKey, sortDir, toggleSort } = useSort(expenses, {
    date: (e) => e.expense_date,
    category: (e) => e.category,
    classification: (e) => e.classification,
    description: (e) => e.description,
    amount: (e) => e.amount,
  })

  if (loading) {
    return (
      <Card className="flex items-center justify-center p-12">
        <LoadingSpinner />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Reintentar
        </Button>
      </Card>
    )
  }

  if (expenses.length === 0) {
    return (
      <Card className="p-12 text-center text-sm text-muted-foreground">
        No hay gastos registrados
      </Card>
    )
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <Card className="p-0 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHead
              label="Fecha"
              sortKey="date"
              activeKey={sortKey}
              direction={sortDir}
              onSort={toggleSort}
            />
            <SortableHead
              label="Categoría"
              sortKey="category"
              activeKey={sortKey}
              direction={sortDir}
              onSort={toggleSort}
            />
            <SortableHead
              label="Clasificación"
              sortKey="classification"
              activeKey={sortKey}
              direction={sortDir}
              onSort={toggleSort}
            />
            <SortableHead
              label="Descripción"
              sortKey="description"
              activeKey={sortKey}
              direction={sortDir}
              onSort={toggleSort}
            />
            <TableHead>Método de pago</TableHead>
            <SortableHead
              label="Monto"
              sortKey="amount"
              activeKey={sortKey}
              direction={sortDir}
              onSort={toggleSort}
              align="right"
            />
            {canEdit && <TableHead className="w-24" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>{formatExpenseDate(expense.expense_date)}</TableCell>
              <TableCell>
                <ExpenseCategoryBadge category={expense.category} />
              </TableCell>
              <TableCell>
                <ExpenseClassificationBadge
                  classification={expense.classification}
                />
              </TableCell>
              <TableCell>
                <div>{expense.description}</div>
                {expense.notes && (
                  <div className="text-xs text-muted-foreground">
                    {expense.notes}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {expense.payment_method
                  ? PAYMENT_METHOD_LABELS[expense.payment_method]
                  : '—'}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(expense.amount)}
              </TableCell>
              {canEdit && (
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(expense)}
                      aria-label="Editar gasto"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(expense)}
                      aria-label="Eliminar gasto"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={5} className="font-semibold">
              Total
            </TableCell>
            <TableCell className="text-right font-semibold">
              {formatCurrency(total)}
            </TableCell>
            {canEdit && <TableCell />}
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  )
}
