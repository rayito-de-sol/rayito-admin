import { useState, useEffect } from 'react'
import { ProductsList } from '@/components/ProductsList'
import { ProductsDetail } from '@/components/ProductsDetail'
import { ProductCreateModal } from '@/components/ProductCreateModal'
import { ProductsCSVImport } from '@/components/ProductsCSVImport'
import type {
  Product,
  ProductStatus,
  ProductCategory,
  ProductType,
} from '@/types/product'
import { productService } from '@/services/productService'
import { useAuth } from '@/hooks/useAuth'

type View = 'list' | 'detail' | 'import'

/**
 * ProductsPage
 * Main page for managing products with table view and detail pages
 */
export const ProductsPage = () => {
  const { user } = useAuth()
  const canEdit = user?.role === 'admin' || user?.role === 'manager'

  const [view, setView] = useState<View>('list')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  )
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>(
    'all'
  )
  const [typeFilter, setTypeFilter] = useState<ProductType | 'all'>('all')

  // Create modal state (still using modal for creation)
  const [showCreateModal, setShowCreateModal] = useState(false)

  /**
   * Fetch products with filters
   * Accepts an optional AbortSignal so the effect cleanup can cancel in-flight requests.
   */
  const fetchProducts = async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      setError(null)

      const filters: any = {}
      if (statusFilter !== 'all') filters.status = statusFilter
      if (categoryFilter !== 'all') filters.category = categoryFilter
      if (typeFilter !== 'all') filters.type = typeFilter

      const data = await productService.listProducts(filters, signal)
      setProducts(data || [])
    } catch (err) {
      if (signal?.aborted) return
      setError(
        err instanceof Error ? err.message : 'Error al cargar los productos'
      )
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }

  /**
   * Fetch products on mount and when filters change.
   * Each run cancels the previous in-flight request via AbortController.
   */
  useEffect(() => {
    const controller = new AbortController()
    fetchProducts(controller.signal)
    return () => controller.abort()
  }, [statusFilter, categoryFilter, typeFilter])

  /**
   * Handle product row click - show detail view
   */
  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId)
    setView('detail')
  }

  /**
   * Handle create button click - show create modal
   */
  const handleCreateClick = () => {
    setShowCreateModal(true)
  }

  /**
   * Handle create product success
   */
  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    fetchProducts()
  }

  /**
   * Handle import button click - show import view
   */
  const handleImportClick = () => {
    setView('import')
  }

  /**
   * Handle successful import - refresh list and return to list view
   */
  const handleImportSuccess = () => {
    fetchProducts()
    setView('list')
  }

  /**
   * Handle back button click - return to list view
   */
  const handleBackClick = () => {
    setView('list')
    setSelectedProductId(null)
  }

  /**
   * Handle reset filters - reset all filters to 'all'
   */
  const handleResetFilters = () => {
    setStatusFilter('all')
    setCategoryFilter('all')
    setTypeFilter('all')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Productos</h1>
        <p className="mt-2 text-muted-foreground">
          Gestiona el catálogo de productos
        </p>
      </div>

      {/* List View */}
      {view === 'list' && (
        <ProductsList
          products={products}
          loading={loading}
          error={error}
          onProductClick={handleProductClick}
          onCreateClick={handleCreateClick}
          onImportClick={handleImportClick}
          onRetry={fetchProducts}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          typeFilter={typeFilter}
          onStatusFilterChange={setStatusFilter}
          onCategoryFilterChange={setCategoryFilter}
          onTypeFilterChange={setTypeFilter}
          onResetFilters={handleResetFilters}
          canEdit={canEdit}
        />
      )}

      {/* Import View */}
      {view === 'import' && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Importar Productos CSV</h2>
            <p className="mt-1 text-muted-foreground">
              Solo productos de tipo simple. Los sets deben crearse manualmente.
            </p>
          </div>
          <ProductsCSVImport
            onSuccess={handleImportSuccess}
            onCancel={() => setView('list')}
          />
        </div>
      )}

      {/* Detail View */}
      {view === 'detail' && selectedProductId && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Detalle del Producto</h2>
          </div>
          <ProductsDetail
            productId={selectedProductId}
            onBack={handleBackClick}
          />
        </div>
      )}

      {/* Create Modal */}
      <ProductCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
