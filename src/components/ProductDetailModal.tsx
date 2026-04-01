import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { StatusBadge } from './StatusBadge'
import { ProductEditModal } from './ProductEditModal'
import { ProductPriceUpdateForm } from './ProductPriceUpdateForm'
import { PriceHistoryModal } from './PriceHistoryModal'
import { AddSizeForm } from './AddSizeForm'
import { VariantCard } from './VariantCard'
import { AddVariantForm } from './AddVariantForm'
import { VariantStockUpdateForm } from './VariantStockUpdateForm'
import { VariantCostUpdateForm } from './VariantCostUpdateForm'
import { CostHistoryModal } from './CostHistoryModal'
import type { Product } from '@/types/product'
import type { Size } from '@/types/size'
import type { Variant } from '@/types/variant'
import { productService } from '@/services/productService'
import { sizeService } from '@/services/sizeService'
import { variantService } from '@/services/variantService'
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
  const [showVariantForm, setShowVariantForm] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [showVariantStockForm, setShowVariantStockForm] = useState(false)
  const [showVariantCostForm, setShowVariantCostForm] = useState(false)
  const [showVariantCostHistory, setShowVariantCostHistory] = useState(false)

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

  /**
   * Handle variant creation
   */
  const handleVariantAdd = async (data: {
    color: string
    size_id: string
    sku: string
    stock: number
    initial_cost: number
    images: any[]
  }) => {
    if (!product) return
    await variantService.createVariant(product.id, data)
    setShowVariantForm(false)
    await loadProduct()
  }

  /**
   * Handle variant stock update
   */
  const handleVariantStockUpdate = async (stock: number) => {
    if (!selectedVariant) return
    await variantService.updateStock(selectedVariant.id, stock)
    setShowVariantStockForm(false)
    setSelectedVariant(null)
    await loadProduct()
  }

  /**
   * Handle variant cost update
   */
  const handleVariantCostUpdate = async (cost: number) => {
    if (!selectedVariant) return
    await variantService.updateCost(selectedVariant.id, cost)
    setShowVariantCostForm(false)
    setSelectedVariant(null)
    await loadProduct()
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

                {/* Variants */}
                <Card className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Variantes</h3>
                    {canEdit && !showVariantForm && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowVariantForm(true)}
                      >
                        Agregar Variante
                      </Button>
                    )}
                  </div>

                  {showVariantForm && (
                    <div className="mb-4">
                      <AddVariantForm
                        productId={product.id}
                        sizes={product.sizes || []}
                        onAdd={handleVariantAdd}
                        onCancel={() => setShowVariantForm(false)}
                      />
                    </div>
                  )}

                  {product.variants && product.variants.length > 0 ? (
                    <div className="space-y-3">
                      {product.variants.map((variant: Variant) => (
                        <VariantCard
                          key={variant.id}
                          variant={variant}
                          canEdit={canEdit}
                          onUpdateStock={(v) => {
                            setSelectedVariant(v)
                            setShowVariantStockForm(true)
                          }}
                          onUpdateCost={(v) => {
                            setSelectedVariant(v)
                            setShowVariantCostForm(true)
                          }}
                          onViewCostHistory={(v) => {
                            setSelectedVariant(v)
                            setShowVariantCostHistory(true)
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    !showVariantForm && (
                      <p className="text-muted-foreground">No hay variantes creadas</p>
                    )
                  )}

                  {/* Variant Stock Update Form */}
                  {showVariantStockForm && selectedVariant && (
                    <div className="mt-4 rounded-lg border p-4">
                      <h4 className="mb-3 font-semibold">
                        Actualizar Stock - {selectedVariant.color}
                      </h4>
                      <VariantStockUpdateForm
                        currentStock={selectedVariant.stock}
                        onUpdate={handleVariantStockUpdate}
                        onCancel={() => {
                          setShowVariantStockForm(false)
                          setSelectedVariant(null)
                        }}
                      />
                    </div>
                  )}

                  {/* Variant Cost Update Form */}
                  {showVariantCostForm &&
                    selectedVariant &&
                    selectedVariant.current_cost !== undefined && (
                      <div className="mt-4 rounded-lg border p-4">
                        <h4 className="mb-3 font-semibold">
                          Actualizar Costo - {selectedVariant.color}
                        </h4>
                        <VariantCostUpdateForm
                          currentCost={selectedVariant.current_cost}
                          onUpdate={handleVariantCostUpdate}
                          onCancel={() => {
                            setShowVariantCostForm(false)
                            setSelectedVariant(null)
                          }}
                        />
                      </div>
                    )}
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

      {/* Variant Cost History Modal */}
      {selectedVariant && (
        <CostHistoryModal
          isOpen={showVariantCostHistory}
          onClose={() => {
            setShowVariantCostHistory(false)
            setSelectedVariant(null)
          }}
          entityType="variant"
          entityId={selectedVariant.id}
          fetchHistory={variantService.getCostHistory}
        />
      )}
    </>
  )
}
