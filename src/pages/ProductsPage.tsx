import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ProductCard'
import { ProductCreateModal } from '@/components/ProductCreateModal'
import { ProductDetailModal } from '@/components/ProductDetailModal'
import type {
  Product,
  ProductStatus,
  ProductCategory,
  ProductType,
} from '@/types/product'
import { productService } from '@/services/productService'
import { useAuth } from '@/hooks/useAuth'

/**
 * ProductsPage
 * Main page for managing products with filters and modals
 */
export const ProductsPage = () => {
  const { user } = useAuth()
  const canEdit = user?.role === 'admin' || user?.role === 'manager'

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>(
    'all'
  )
  const [typeFilter, setTypeFilter] = useState<ProductType | 'all'>('all')

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  )

  /**
   * Fetch products with filters
   */
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters: any = {}
      if (statusFilter !== 'all') filters.status = statusFilter
      if (categoryFilter !== 'all') filters.category = categoryFilter
      if (typeFilter !== 'all') filters.type = typeFilter

      const data = await productService.listProducts(filters)
      setProducts(data || [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar los productos'
      )
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch products on mount and when filters change
   */
  useEffect(() => {
    fetchProducts()
  }, [statusFilter, categoryFilter, typeFilter])

  /**
   * Handle product card click
   */
  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId)
    setShowDetailModal(true)
  }

  /**
   * Handle detail modal close
   */
  const handleDetailClose = () => {
    setShowDetailModal(false)
    setSelectedProductId(null)
  }

  /**
   * Handle detail modal update
   */
  const handleDetailUpdate = () => {
    fetchProducts()
  }

  /**
   * Handle create product success
   */
  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    fetchProducts()
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Productos</h1>
            <p className="mt-2 text-muted-foreground">
              Gestiona el catálogo de productos
            </p>
          </div>
          {canEdit && (
            <Button onClick={() => setShowCreateModal(true)}>
              Crear Producto
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        {/* Status filter */}
        <div>
          <label className="mb-2 block text-sm font-medium">Estado</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="all">Todos</option>
            <option value="draft">Borrador</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>

        {/* Category filter */}
        <div>
          <label className="mb-2 block text-sm font-medium">Categoría</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="all">Todas</option>
            <option value="set">Set</option>
            <option value="turbante">Turbante</option>
            <option value="cintillo">Cintillo</option>
            <option value="pinza">Pinza</option>
            <option value="maximono">Maximono</option>
            <option value="mono">Mono</option>
            <option value="diadema">Diadema</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        {/* Type filter */}
        <div>
          <label className="mb-2 block text-sm font-medium">Tipo</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="all">Todos</option>
            <option value="single">Simple</option>
            <option value="set">Set</option>
          </select>
        </div>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchProducts}
            className="ml-4"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && products.length === 0 && (
        <div className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/50 p-12 text-center">
          <p className="text-lg text-muted-foreground">
            No hay productos registrados
          </p>
          {canEdit && (
            <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
              Crear Primer Producto
            </Button>
          )}
        </div>
      )}

      {/* Products grid */}
      {!loading && !error && products.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={handleProductClick}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <ProductCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Detail Modal */}
      {selectedProductId && (
        <ProductDetailModal
          isOpen={showDetailModal}
          onClose={handleDetailClose}
          productId={selectedProductId}
          onUpdate={handleDetailUpdate}
        />
      )}
    </div>
  )
}
