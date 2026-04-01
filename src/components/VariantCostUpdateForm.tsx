import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { formatCurrency } from '@/utils/currency'

interface VariantCostUpdateFormProps {
  currentCost: number
  onUpdate: (cost: number) => Promise<void>
  onCancel: () => void
}

/**
 * VariantCostUpdateForm
 * Inline form for updating variant cost
 */
export const VariantCostUpdateForm = ({
  currentCost,
  onUpdate,
  onCancel,
}: VariantCostUpdateFormProps) => {
  const [cost, setCost] = useState(currentCost.toString())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const costValue = parseFloat(cost)
    if (isNaN(costValue) || costValue < 0) {
      setError('El costo debe ser mayor o igual a cero')
      return
    }

    try {
      setLoading(true)
      await onUpdate(costValue)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el costo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-2 text-sm text-muted-foreground">
          Costo actual: {formatCurrency(currentCost)}
        </p>
        <Label htmlFor="cost">Nuevo Costo *</Label>
        <Input
          id="cost"
          type="number"
          min="0"
          step="0.01"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          required
          disabled={loading}
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
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar Costo'}
        </Button>
      </div>
    </form>
  )
}
