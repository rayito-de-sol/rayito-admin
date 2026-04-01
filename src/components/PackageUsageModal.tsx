import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import type { Package } from '@/types/package'
import type { Product } from '@/types/product'
import { productService } from '@/services/productService'
import { formatCurrency } from '@/utils/currency'

interface PackageUsageModalProps {
  isOpen: boolean
  onClose: () => void
  package: Package
}

/**
 * PackageUsageModal
 * Display list of products that use this package
 */
export const PackageUsageModal = ({
  isOpen,
  onClose,
  package: pkg,
}: PackageUsageModalProps) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadProductsUsingPackage()
    }
  }, [isOpen, pkg.id])

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

  const loadProductsUsingPackage = async () => {
    try {
      setLoading(true)
      setError(null)
      const allProducts = await productService.listProducts()
      // Filter products that use this package
      const filtered = allProducts.filter(
        (product) => product.package_id === pkg.id
      )
      setProducts(filtered)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar los productos'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        <div className="relative z-10 w-full max-w-2xl rounded-lg bg-background p-6 shadow-lg">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Productos que usan "{pkg.name}"
            </h2>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Cargando productos...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-4 text-destructive">
              {error}
            </div>
          )}

          {/* Products list */}
          {!loading && !error && (
            <>
              {products.length === 0 ? (
                <div className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/50 p-12 text-center">
                  <p className="text-lg text-muted-foreground">
                    Ningún producto usa este empaque
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
                          <span>
                            {categoryLabels[product.category] ||
                              product.category}
                          </span>
                          <span>•</span>
                          <span>
                            {product.type === 'set' ? 'Set' : 'Simple'}
                          </span>
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
            </>
          )}

          {/* Close button */}
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
