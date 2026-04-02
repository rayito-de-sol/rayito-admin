import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import type { Variant } from '@/types/variant'
import { formatCurrency } from '@/utils/currency'

interface SetComponent {
  variant_id: string
  variant: Variant
  quantity: number
}

/**
 * Props for SetCompositionForm component
 */
interface SetCompositionFormProps {
  components: SetComponent[]
  availableVariants: Variant[]
  canEdit: boolean
  onAddComponent: (variantId: string, quantity: number) => Promise<void>
  onRemoveComponent: (variantId: string) => Promise<void>
  onUpdateQuantity: (variantId: string, quantity: number) => Promise<void>
}

/**
 * SetCompositionForm
 * Manage set product components with computed costs
 */
export const SetCompositionForm = ({
  components,
  availableVariants,
  canEdit,
  onAddComponent,
  onRemoveComponent,
  onUpdateQuantity: _onUpdateQuantity,
}: SetCompositionFormProps) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Get variants not already in composition
   */
  const getAvailableVariants = () => {
    const componentVariantIds = components.map((c) => c.variant_id)
    return availableVariants.filter((v) => !componentVariantIds.includes(v.id))
  }

  /**
   * Handle add component
   */
  const handleAddComponent = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedVariantId) {
      setError('Debe seleccionar una variante')
      return
    }

    const qty = parseInt(quantity, 10)
    if (isNaN(qty) || qty < 1) {
      setError('La cantidad debe ser mayor a cero')
      return
    }

    try {
      setLoading(true)
      await onAddComponent(selectedVariantId, qty)
      setShowAddForm(false)
      setSelectedVariantId('')
      setQuantity('1')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al agregar componente'
      )
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle remove component with confirmation
   */
  const handleRemoveComponent = async (variantId: string) => {
    if (components.length === 1) {
      alert('Un set debe tener al menos un componente')
      return
    }

    if (!window.confirm('¿Está seguro de eliminar este componente del set?')) {
      return
    }

    try {
      await onRemoveComponent(variantId)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar componente')
    }
  }

  const availableForAdd = getAvailableVariants()

  return (
    <div className="space-y-4">
      {/* Component List */}
      <div className="space-y-3">
        {components.map((component) => {
          const lineTotal =
            component.quantity * (component.variant.current_cost || 0)

          return (
            <div
              key={component.variant_id}
              className="flex items-start justify-between rounded-lg border p-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{component.variant.color}</span>
                  <span className="text-sm text-muted-foreground">
                    ({component.variant.size?.label})
                  </span>
                  <span className="text-xs text-muted-foreground">
                    SKU: {component.variant.sku}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm">
                  <div>
                    <span className="font-medium">Cantidad:</span>{' '}
                    {component.quantity}
                  </div>
                  {component.variant.current_cost !== undefined && (
                    <>
                      <div>
                        <span className="font-medium">Costo unitario:</span>{' '}
                        {formatCurrency(component.variant.current_cost)}
                      </div>
                      <div>
                        <span className="font-medium">Subtotal:</span>{' '}
                        {formatCurrency(lineTotal)}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {canEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveComponent(component.variant_id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  Eliminar
                </Button>
              )}
            </div>
          )
        })}
      </div>

      {/* Add Component Form */}
      {canEdit && (
        <>
          {!showAddForm && availableForAdd.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddForm(true)}
            >
              + Agregar Componente
            </Button>
          )}

          {showAddForm && (
            <form
              onSubmit={handleAddComponent}
              className="rounded-lg border p-4"
            >
              <h4 className="mb-3 font-semibold">Agregar Componente</h4>

              {availableForAdd.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay más variantes disponibles para agregar
                </p>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="variant_id" className="mb-2">
                      Variante *
                    </Label>
                    <select
                      id="variant_id"
                      value={selectedVariantId}
                      onChange={(e) => setSelectedVariantId(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      required
                      disabled={loading}
                    >
                      <option value="">Seleccionar variante</option>
                      {availableForAdd.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.color} - {variant.size?.label} (SKU:{' '}
                          {variant.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="quantity" className="mb-2">
                      Cantidad *
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  {error && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false)
                        setError(null)
                      }}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" size="sm" disabled={loading}>
                      {loading ? 'Agregando...' : 'Agregar'}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          )}
        </>
      )}
    </div>
  )
}
