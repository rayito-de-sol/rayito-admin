import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { formatCurrency } from '@/utils/currency'

interface ProductPriceUpdateFormProps {
  currentPrice: number
  onUpdate: (price: number) => Promise<void>
  onCancel: () => void
}

/**
 * ProductPriceUpdateForm
 * Inline form for updating product price
 */
export const ProductPriceUpdateForm = ({
  currentPrice,
  onUpdate,
  onCancel,
}: ProductPriceUpdateFormProps) => {
  const [price, setPrice] = useState(currentPrice.toString())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const priceValue = parseFloat(price)
    if (isNaN(priceValue) || priceValue < 0) {
      setError('El precio debe ser mayor o igual a cero')
      return
    }

    try {
      setLoading(true)
      await onUpdate(priceValue)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al actualizar el precio'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-2 text-sm text-muted-foreground">
          Precio actual: {formatCurrency(currentPrice)}
        </p>
        <Label htmlFor="price">Nuevo Precio *</Label>
        <Input
          id="price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
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
          {loading ? 'Actualizando...' : 'Actualizar Precio'}
        </Button>
      </div>
    </form>
  )
}
