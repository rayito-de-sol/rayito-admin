import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { CostHistoryModal } from './CostHistoryModal'
import type { Package } from '@/types/package'
import { packageService } from '@/services/packageService'
import { formatCurrency } from '@/utils/currency'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/utils/toast'

/**
 * Props for PackageEditModal component
 */
interface PackageEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  package: Package
}

/**
 * PackageEditModal
 * Modal for editing packages and managing costs
 */
export const PackageEditModal = ({
  isOpen,
  onClose,
  onSuccess,
  package: pkg,
}: PackageEditModalProps) => {
  const { user } = useAuth()
  const canEdit = user?.role === 'admin' || user?.role === 'manager'

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [showCostForm, setShowCostForm] = useState(false)
  const [showCostHistory, setShowCostHistory] = useState(false)
  const [newCost, setNewCost] = useState('')
  const [loading, setLoading] = useState(false)
  const [costLoading, setCostLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Initialize form data
   */
  useEffect(() => {
    if (isOpen && pkg) {
      setFormData({
        name: pkg.name,
        description: pkg.description || '',
      })
      setNewCost(pkg.current_cost?.toString() || '')
    }
  }, [isOpen, pkg])

  /**
   * Handle ESC key to close modal
   */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  /**
   * Handle input change
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  /**
   * Handle form submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('El nombre es requerido')
      return
    }

    try {
      setLoading(true)
      await packageService.updatePackage(pkg.id, {
        name: formData.name,
        description: formData.description || undefined,
      })
      toast.success('Empaque actualizado exitosamente')
      onSuccess()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al actualizar el empaque'
      )
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle cost update
   */
  const handleCostUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cost = parseFloat(newCost)
    if (isNaN(cost) || cost < 0) {
      setError('El costo debe ser mayor o igual a cero')
      return
    }

    try {
      setCostLoading(true)
      await packageService.updateCost(pkg.id, cost)
      toast.success('Costo del empaque actualizado exitosamente')
      setShowCostForm(false)
      onSuccess()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al actualizar el costo'
      )
    } finally {
      setCostLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-2xl rounded-lg bg-background p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Editar Empaque</h2>
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              ×
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="name" className="mb-2">
                Nombre *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading || !canEdit}
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="mb-2">
                Descripción
              </Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                disabled={loading || !canEdit}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Actions */}
            {canEdit && (
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
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </Button>
              </div>
            )}
          </form>

          {/* Cost Management Section */}
          <div className="mt-6 border-t pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Costo</h3>
              {canEdit && !showCostForm && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCostForm(true)}
                >
                  Actualizar Costo
                </Button>
              )}
            </div>

            {!showCostForm && pkg.current_cost !== undefined && (
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(pkg.current_cost)}
                </p>
                <Button
                  size="sm"
                  variant="link"
                  className="mt-2 p-0"
                  onClick={() => setShowCostHistory(true)}
                >
                  Ver historial de costos
                </Button>
              </div>
            )}

            {showCostForm && (
              <form onSubmit={handleCostUpdate} className="space-y-4">
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    Costo actual:{' '}
                    {pkg.current_cost !== undefined
                      ? formatCurrency(pkg.current_cost)
                      : 'N/A'}
                  </p>
                  <Label htmlFor="new_cost" className="mb-2">
                    Nuevo Costo *
                  </Label>
                  <Input
                    id="new_cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    required
                    disabled={costLoading}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCostForm(false)}
                    disabled={costLoading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={costLoading}>
                    {costLoading ? 'Actualizando...' : 'Actualizar Costo'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Cost History Modal */}
      <CostHistoryModal
        isOpen={showCostHistory}
        onClose={() => setShowCostHistory(false)}
        entityType="package"
        entityId={pkg.id}
        fetchHistory={packageService.getCostHistory}
      />
    </>
  )
}
