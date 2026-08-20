import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { financesApi } from '../api/financesApi'
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
  type Expense,
  type ExpenseCategory,
  type ExpensePaymentMethod,
} from '../types/finance.types'
import { toast } from '@/utils/toast'

interface ExpenseFormModalProps {
  open: boolean
  expense: Expense | null // null = crear, con valor = editar
  onClose: () => void
  onSuccess: () => void
}

/**
 * ExpenseFormModal
 * Formulario para crear o editar un gasto.
 */
export const ExpenseFormModal = ({
  open,
  expense,
  onClose,
  onSuccess,
}: ExpenseFormModalProps) => {
  const [expenseDate, setExpenseDate] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('materiales')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<
    ExpensePaymentMethod | 'none'
  >('none')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    if (expense) {
      setExpenseDate(expense.expense_date.slice(0, 10))
      setCategory(expense.category)
      setDescription(expense.description)
      setAmount(String(expense.amount))
      setPaymentMethod(expense.payment_method ?? 'none')
      setNotes(expense.notes ?? '')
    } else {
      setExpenseDate(new Date().toISOString().slice(0, 10))
      setCategory('materiales')
      setDescription('')
      setAmount('')
      setPaymentMethod('none')
      setNotes('')
    }
  }, [open, expense])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const parsedAmount = parseFloat(amount)
    if (!expenseDate) {
      setError('La fecha es requerida')
      return
    }
    if (!description.trim()) {
      setError('La descripción es requerida')
      return
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('El monto debe ser un número mayor a cero')
      return
    }

    const payload = {
      expense_date: expenseDate,
      category,
      description: description.trim(),
      amount: parsedAmount,
      payment_method: paymentMethod === 'none' ? undefined : paymentMethod,
      notes: notes.trim() || undefined,
    }

    setLoading(true)
    try {
      if (expense) {
        await financesApi.updateExpense(expense.id, payload)
        toast.success('Gasto actualizado')
      } else {
        await financesApi.createExpense(payload)
        toast.success('Gasto registrado')
      }
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error guardando gasto:', err)
      setError(err instanceof Error ? err.message : 'Error al guardar el gasto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? 'Editar gasto' : 'Nuevo gasto'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="expense-date" className="mb-2">
              Fecha *
            </Label>
            <Input
              id="expense-date"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-2">Categoría *</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as ExpenseCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {EXPENSE_CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="expense-description" className="mb-2">
              Descripción *
            </Label>
            <Input
              id="expense-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Compra de telas"
            />
          </div>

          <div>
            <Label htmlFor="expense-amount" className="mb-2">
              Monto (COP) *
            </Label>
            <Input
              id="expense-amount"
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="150000"
            />
          </div>

          <div>
            <Label className="mb-2">Método de pago</Label>
            <Select
              value={paymentMethod}
              onValueChange={(v) =>
                setPaymentMethod(v as ExpensePaymentMethod | 'none')
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin especificar</SelectItem>
                {(
                  Object.keys(PAYMENT_METHOD_LABELS) as ExpensePaymentMethod[]
                ).map((m) => (
                  <SelectItem key={m} value={m}>
                    {PAYMENT_METHOD_LABELS[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="expense-notes" className="mb-2">
              Notas
            </Label>
            <Input
              id="expense-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? 'Guardando...'
                : expense
                  ? 'Guardar cambios'
                  : 'Registrar gasto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
