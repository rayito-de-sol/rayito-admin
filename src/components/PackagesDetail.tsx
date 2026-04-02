import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { LoadingSpinner } from './LoadingSpinner'
import { CostHistoryModal } from './CostHistoryModal'
import type { Package } from '@/types/package'
import type { Product } from '@/types/product'
import { packageService } from '@/services/packageService'
import { productService } from '@/services/productService'
import { formatCurrency } from '@/utils/currency'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/utils/toast'

interface PackagesDetailProps {
  packageId: string
  onBack: () => void
  onEdit: () => void
}

/**
 * PackagesDetail component
 * Displays complete package information with cost management and usage
 */
export const PackagesDetail = ({
  packageId,
  onBack,
  onEdit,
}: PackagesDetailProps) => {
  const { user } = useAuth()
  const canEdit = user?.role === 'admin' || user?.role === 'manager'

  const [pkg, setPackage] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cost management state
  const [showCostForm, setShowCostForm] = useState(false)
  const [showCostHistory, setShowCostHistory] = useState(false)
  const [newCost, setNewCost] = useState('')
  const [costLoading, setCostLoading] = useState(false)

  // Usage state
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  useEffect(() => {
    if (packageId) {
      fetchPackage()
      loadProductsUsingPackage()
    }
  }, [packageId])

  /**
   * Fetch package details
   */
  const fetchPackage = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await packageService.getPackage(packageId)
      setPackage(data)
      setNewCost(data.current_cost?.toString() || '')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error al cargar el empaque')
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load products that use this package
   */
  const loadProductsUsingPackage = async () => {
    try {
      setLoadingProducts(true)
      const allProducts = await productService.listProducts()
      // Filter products that use this package
      const filtered = allProducts.filter(
        (product) => product.package_id === packageId
      )
      setProducts(filtered)
    } catch (err) {
      console.error('Error loading products:', err)
    } finally {
      setLoadingProducts(false)
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
      await packageService.updateCost(packageId, cost)
      toast.success('Costo del empaque actualizado exitosamente')
      setShowCostForm(false)
      await fetchPackage()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al actualizar el costo'
      )
    } finally {
      setCostLoading(false)
    }
  }

  const categoryLabels: Record<string, string> = {
    set: 'Set',
    turbante: 'Turbante',
    cintillo: 'Cintillo',
    pinza: 'Pinza',
    maximono: 'Maximono',
    mono: 'Mono',
    diadema: 'Diadema',
    otro: 'Otro',
  }

  // Loading state
  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    )
  }

  // Error state
  if (error || !pkg) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="mb-4 text-destructive">
            {error || 'Empaque no encontrado'}
          </p>
          <Button onClick={onBack} variant="outline">
            Volver
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button onClick={onBack} variant="outline">
            Volver
          </Button>
          {canEdit && <Button onClick={onEdit}>Editar</Button>}
        </div>

        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">
            Información del Empaque
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Nombre
              </p>
              <p className="text-base">{pkg.name}</p>
            </div>
            {pkg.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Descripción
                </p>
                <p className="text-base">{pkg.description}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Cost Management */}
        <Card className="p-6">
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
        </Card>

        {/* Usage Section */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">
            Productos que usan este empaque
          </h3>

          {loadingProducts ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground">
              Ningún producto usa este empaque
            </p>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <h4 className="font-semibold">{product.name}</h4>
                    <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
                      <span>
                        {categoryLabels[product.category] || product.category}
                      </span>
                      <span>•</span>
                      <span>{product.type === 'set' ? 'Set' : 'Simple'}</span>
                      {product.current_price !== undefined && (
                        <>
                          <span>•</span>
                          <span>{formatCurrency(product.current_price)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        product.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : product.status === 'draft'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.status === 'active'
                        ? 'Activo'
                        : product.status === 'draft'
                          ? 'Borrador'
                          : 'Inactivo'}
                    </span>
                  </div>
                </div>
              ))}

              <div className="mt-4 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Total: {products.length} producto
                  {products.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Cost History Modal */}
      <CostHistoryModal
        isOpen={showCostHistory}
        onClose={() => setShowCostHistory(false)}
        entityType="package"
        entityId={packageId}
        fetchHistory={packageService.getCostHistory}
      />
    </>
  )
}
