import { Product, ProductStatus, ProductCategory, ProductType } from '@/types/product'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { StatusBadge } from '@/components/StatusBadge'
import { Plus, Upload, X } from 'lucide-react'
import { formatCurrency } from '@/utils/currency'

interface ProductsListProps {
  products: Product[]
  loading: boolean
  error: string | null
  onProductClick: (productId: string) => void
  onCreateClick: () => void
  onImportClick: () => void
  onRetry: () => void
  // Filters
  statusFilter: ProductStatus | 'all'
  categoryFilter: ProductCategory | 'all'
  typeFilter: ProductType | 'all'
  onStatusFilterChange: (status: ProductStatus | 'all') => void
  onCategoryFilterChange: (category: ProductCategory | 'all') => void
  onTypeFilterChange: (type: ProductType | 'all') => void
  onResetFilters: () => void
  canEdit: boolean
}

/**
 * ProductsList component
 * Displays all products in a table with filters, loading, empty, and error states
 */
export const ProductsList = ({
  products,
  loading,
  error,
  onProductClick,
  onCreateClick,
  onImportClick,
  onRetry,
  statusFilter,
  categoryFilter,
  typeFilter,
  onStatusFilterChange,
  onCategoryFilterChange,
  onTypeFilterChange,
  onResetFilters,
  canEdit,
}: ProductsListProps) => {
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

  // Check if any filter is active
  const hasActiveFilters =
    statusFilter !== 'all' || categoryFilter !== 'all' || typeFilter !== 'all'

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
  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="mb-4 text-destructive">{error}</p>
          <Button onClick={onRetry} variant="outline">
            Reintentar
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Status filter */}
        <div>
          <label className="mb-2 block text-sm font-medium">Estado</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as any)}
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
            onChange={(e) => onCategoryFilterChange(e.target.value as any)}
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
            onChange={(e) => onTypeFilterChange(e.target.value as any)}
            className="rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="all">Todos</option>
            <option value="single">Simple</option>
            <option value="set">Set</option>
          </select>
        </div>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <div>
            <Button variant="outline" onClick={onResetFilters}>
              <X className="mr-2 h-4 w-4" />
              Limpiar Filtros
            </Button>
          </div>
        )}
      </div>

      {/* Create / Import Buttons */}
      {canEdit && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onImportClick}>
            <Upload className="mr-2 h-4 w-4" />
            Importar CSV
          </Button>
          <Button onClick={onCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>
      )}

      {/* Empty state - no products at all */}
      {products.length === 0 && !hasActiveFilters && (
        <Card className="p-8">
          <div className="text-center">
            <p className="mb-4 text-muted-foreground">
              No hay productos registrados
            </p>
            {canEdit && (
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={onImportClick}>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar CSV
                </Button>
                <Button onClick={onCreateClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Producto
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Empty state - no products matching filters */}
      {products.length === 0 && hasActiveFilters && (
        <Card className="p-8">
          <div className="text-center">
            <p className="mb-4 text-muted-foreground">
              No se encontraron productos con los filtros seleccionados
            </p>
            <Button onClick={onResetFilters} variant="outline">
              <X className="mr-2 h-4 w-4" />
              Limpiar Filtros
            </Button>
          </div>
        </Card>
      )}

      {/* Table with products */}
      {products.length > 0 && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Precio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  onClick={() => onProductClick(product.id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {categoryLabels[product.category] || product.category}
                  </TableCell>
                  <TableCell>
                    {product.type === 'set' ? 'Set' : 'Simple'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={product.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {product.current_price !== undefined
                      ? formatCurrency(product.current_price)
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
