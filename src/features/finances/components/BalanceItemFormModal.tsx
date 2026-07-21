import { useEffect, useState } from 'react'
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
import type { BalanceItem, BalanceItemType } from '../types/finance.types'
import { toast } from '@/utils/toast'

interface BalanceItemFormModalProps {
  open: boolean
  item: BalanceItem | null // null = crear
  defaultType: BalanceItemType
  onClose: () => void
  onSuccess: () => void
}

/**
 * BalanceItemFormModal
 * Formulario para crear o editar un ítem manual del balance
 * (cuentas bancarias, préstamos, otros activos/pasivos).
 */
export const BalanceItemFormModal = ({
  open,
  item,
  defaultType,
  onClose,
  onSuccess,
}: BalanceItemFormModalProps) => {
  const [itemType, setItemType] = useState<BalanceItemType>(defaultType)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    if (item) {
      setItemType(item.item_type)
      setName(item.name)
      setAmount(String(item.amount))
      setNotes(item.notes ?? '')
    } else {
      setItemType(defaultType)
      setName('')
      setAmount('')
      setNotes('')
    }
  }, [open, item, defaultType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const parsedAmount = parseFloat(amount)
    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setError('El monto debe ser un número mayor o igual a cero')
      return
    }

    const payload = {
      item_type: itemType,
      name: name.trim(),
      amount: parsedAmount,
      notes: notes.trim() || undefined,
    }

    setLoading(true)
    try {
      if (item) {
        await financesApi.updateBalanceItem(item.id, payload)
        toast.success('Ítem actualizado')
      } else {
        await financesApi.createBalanceItem(payload)
        toast.success('Ítem agregado')
      }
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error guardando ítem de balance:', err)
      setError(err instanceof Error ? err.message : 'Error al guardar el ítem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Editar ítem del balance' : 'Nuevo ítem del balance'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-2">Tipo *</Label>
            <Select
              value={itemType}
              onValueChange={(v) => setItemType(v as BalanceItemType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asset">Activo</SelectItem>
                <SelectItem value="liability">Pasivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="balance-item-name" className="mb-2">
              Nombre *
            </Label>
            <Input
              id="balance-item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Cuenta bancaria"
            />
          </div>

          <div>
            <Label htmlFor="balance-item-amount" className="mb-2">
              Monto (COP) *
            </Label>
            <Input
              id="balance-item-amount"
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="balance-item-notes" className="mb-2">
              Notas
            </Label>
            <Input
              id="balance-item-notes"
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
              {loading ? 'Guardando...' : item ? 'Guardar cambios' : 'Agregar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
