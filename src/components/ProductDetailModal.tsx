import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { StatusBadge } from './StatusBadge'
import { ProductEditModal } from './ProductEditModal'
import { ProductPriceUpdateForm } from './ProductPriceUpdateForm'
import { PriceHistoryModal } from './PriceHistoryModal'
import { AddSizeForm } from './AddSizeForm'
import type { Product } from '@/types/product'
import type { Size } from '@/types/size'
import { productService } from '@/services/productService'
import { sizeService } from '@/services/sizeService'
import { formatCurrency } from '@/utils/currency'
import { useAuth } from '@/hooks/useAuth'

interface ProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  onUpdate?: () => void
}

/**
 * ProductDetailModal
 * Comprehensive product detail view with variants, sizes, pricing
 */
export const ProductDetailModal = ({
  isOpen,
  onClose,
  productId,
  onUpdate,
}: ProductDetailModalProps) => {
  const { user } = useAuth()
  const canEdit = user?.role === 'admin' || user?.role === 'manager'

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sub-modals and forms state
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPriceForm, setShowPriceForm] = useState(false)
  const [showPriceHistory, setShowPriceHistory] = useState(false)
  const [showSizeForm, setShowSizeForm] = useState(false)

  /**
   * Load product details
   */
  const loadProduct = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await productService.getProduct(productId)
      setProduct(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el producto')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && productId) {
      loadProduct()
    }
  }, [isOpen, productId])

  /**
   * Handle price update
   */
  const handlePriceUpdate = async (price: number) => {
    if (!product) return
    await productService.updatePrice(product.id, price)
    setShowPriceForm(false)
    await loadProduct()
    onUpdate?.()
  }

  /**
   * Handle size creation
   */
  const handleSizeAdd = async (label: string) => {
    if (!product) return
    await sizeService.createSize(product.id, { label })
    setShowSizeForm(false)
    await loadProduct()
  }

  /**
   * Handle edit success
   */
  const handleEditSuccess = async () => {
    setShowEditModal(false)
    await loadProduct()
    onUpdate?.()
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
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          />

          <div className="relative z-10 w-full max-w-4xl rounded-lg bg-background p-6 shadow-lg">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Detalle del Producto</h2>
              <Button variant="ghost" onClick={onClose}>
                ×
              </Button>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Cargando...</p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="rounded-md bg-destructive/10 p-4 text-destructive">
                {error}
              </div>
            )}

            {/* Product details */}
            {product && !loading && (
              <div className="space-y-6">
                {/* Basic Information */}
                <Card className="p-4">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.slug}
                      </p>
                    </div>
                    <StatusBadge status={product.status} />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Categoría
                      </p>
                      <p>{categoryLabels[product.category] || product.category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Tipo
                      </p>
                      <p>{product.type === 'set' ? 'Set' : 'Simple'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Prefijo SKU
                      </p>
                      <p>{product.sku_prefix}</p>
                    </div>
                    {product.package && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Empaque
                        </p>
                        <p>
                          {product.package.name}{' '}
                          {product.package.current_cost !== undefined &&
                            `(${formatCurrency(product.package.current_cost)})`}
                        </p>
                      </div>
                    )}
                    {!product.package_id && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Empaque
                        </p>
                        <p>Sin empaque</p>
                      </div>
                    )}
                  </div>

                  {product.description && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Descripción
                      </p>
                      <p className="mt-1">{product.description}</p>
                    </div>
                  )}

                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Etiquetas
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-muted px-2 py-1 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {canEdit && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowEditModal(true)}
                      >
                        Editar
                      </Button>
                    </div>
                  )}
                </Card>

                {/* Pricing */}
                <Card className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Precio</h3>
                    {canEdit && !showPriceForm && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowPriceForm(true)}
                      >
                        Actualizar Precio
                      </Button>
                    )}
                  </div>

                  {!showPriceForm && product.current_price !== undefined && (
                    <div>
                      <p className="text-2xl font-bold">
                        {formatCurrency(product.current_price)}
                      </p>
                      <Button
                        size="sm"
                        variant="link"
                        className="mt-2 p-0"
                        onClick={() => setShowPriceHistory(true)}
                      >
                        Ver historial de precios
                      </Button>
                    </div>
                  )}

                  {showPriceForm && product.current_price !== undefined && (
                    <ProductPriceUpdateForm
                      currentPrice={product.current_price}
                      onUpdate={handlePriceUpdate}
                      onCancel={() => setShowPriceForm(false)}
                    />
                  )}
                </Card>

                {/* Sizes */}
                <Card className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Tallas</h3>
                    {canEdit && !showSizeForm && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowSizeForm(true)}
                      >
                        Agregar Talla
                      </Button>
                    )}
                  </div>

                  {showSizeForm && (
                    <div className="mb-4">
                      <AddSizeForm
                        onAdd={handleSizeAdd}
                        onCancel={() => setShowSizeForm(false)}
                      />
                    </div>
                  )}

                  {product.sizes && product.sizes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size: Size) => (
                        <span
                          key={size.id}
                          className="rounded-lg border bg-muted px-3 py-2 text-sm"
                        >
                          {size.label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No hay tallas creadas</p>
                  )}
                </Card>

                {/* Variants - Placeholder */}
                <Card className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Variantes</h3>
                    {canEdit && (
                      <Button size="sm" variant="outline" disabled>
                        Agregar Variante
                      </Button>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    Variantes (próximamente)
                  </p>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {product && (
        <ProductEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
          product={product}
        />
      )}

      {/* Price History Modal */}
      <PriceHistoryModal
        isOpen={showPriceHistory}
        onClose={() => setShowPriceHistory(false)}
        productId={productId}
        fetchHistory={productService.getPriceHistory}
      />
    </>
  )
}
