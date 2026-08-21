import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ExpensesTable,
  ExpenseFormModal,
  ExpensesCSVImport,
  useExpenses,
  financesApi,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CLASSIFICATIONS,
  EXPENSE_CLASSIFICATION_LABELS,
  type Expense,
  type ExpenseCategory,
  type ExpenseClassification,
} from '@/features/finances'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from '@/utils/toast'
import { Plus, Upload } from 'lucide-react'

/**
 * GastosPage
 * Gestión de gastos operativos: registro manual, edición y carga inicial por CSV.
 */
export const GastosPage = () => {
  const { user } = useAuthStore()
  const canWrite = user?.role === 'admin' || user?.role === 'manager'

  const [categoryFilter, setCategoryFilter] = useState<
    ExpenseCategory | 'all'
  >('all')
  const [classificationFilter, setClassificationFilter] = useState<
    ExpenseClassification | 'all'
  >('all')
  const { expenses, isLoading, error, refetch } = useExpenses(
    categoryFilter,
    classificationFilter
  )

  const [showImport, setShowImport] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const handleDelete = async (expense: Expense) => {
    if (!window.confirm(`¿Eliminar el gasto "${expense.description}"?`)) {
      return
    }
    try {
      await financesApi.deleteExpense(expense.id)
      toast.success('Gasto eliminado')
      refetch()
    } catch (err) {
      console.error('Error eliminando gasto:', err)
      toast.error('Error al eliminar el gasto')
    }
  }

  if (showImport) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Importar gastos</h1>
        <ExpensesCSVImport
          onSuccess={() => {
            toast.success('Gastos importados')
            refetch()
          }}
          onCancel={() => setShowImport(false)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gastos</h1>
        {canWrite && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowImport(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Importar CSV
            </Button>
            <Button
              onClick={() => {
                setEditingExpense(null)
                setFormOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo gasto
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <div className="w-56">
          <Select
            value={categoryFilter}
            onValueChange={(v) =>
              setCategoryFilter(v as ExpenseCategory | 'all')
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {EXPENSE_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {EXPENSE_CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-56">
          <Select
            value={classificationFilter}
            onValueChange={(v) =>
              setClassificationFilter(v as ExpenseClassification | 'all')
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las clasificaciones</SelectItem>
              {EXPENSE_CLASSIFICATIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {EXPENSE_CLASSIFICATION_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ExpensesTable
        expenses={expenses}
        loading={isLoading}
        error={error}
        canEdit={canWrite}
        onRetry={refetch}
        onEdit={(expense) => {
          setEditingExpense(expense)
          setFormOpen(true)
        }}
        onDelete={handleDelete}
      />

      <ExpenseFormModal
        open={formOpen}
        expense={editingExpense}
        onClose={() => setFormOpen(false)}
        onSuccess={refetch}
      />
    </div>
  )
}
