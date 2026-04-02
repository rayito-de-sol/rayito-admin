import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface VariantStockUpdateFormProps {
  currentStock: number
  onUpdate: (stock: number) => Promise<void>
  onCancel: () => void
}

/**
 * VariantStockUpdateForm
 * Inline form for updating variant stock
 */
export const VariantStockUpdateForm = ({
  currentStock,
  onUpdate,
  onCancel,
}: VariantStockUpdateFormProps) => {
  const [stock, setStock] = useState(currentStock.toString())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const stockValue = parseInt(stock, 10)
    if (isNaN(stockValue) || stockValue < 0) {
      setError('El stock debe ser mayor o igual a cero')
      return
    }

    try {
      setLoading(true)
      await onUpdate(stockValue)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al actualizar el stock'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-2 text-sm text-muted-foreground">
          Stock actual: {currentStock} unidades
        </p>
        <Label htmlFor="stock" className="mb-2">
          Nuevo Stock *
        </Label>
        <Input
          id="stock"
          type="number"
          min="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
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
          {loading ? 'Actualizando...' : 'Actualizar Stock'}
        </Button>
      </div>
    </form>
  )
}
