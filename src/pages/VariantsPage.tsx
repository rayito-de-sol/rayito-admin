import { useState, useEffect } from 'react'
import { Plus, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { VariantCreateModal } from '@/components/VariantCreateModal'
import { VariantsCSVImport } from '@/components/VariantsCSVImport'
import { SortableHead } from '@/components/SortableHead'
import { useSort } from '@/hooks/useSort'
import { variantService } from '@/services/variantService'
import { useAuth } from '@/hooks/useAuth'
import type { Variant } from '@/types/variant'

const variantSKU = (v: Variant) =>
  [v.product_sku, v.color?.sku, v.size?.sku].filter(Boolean).join('-')

type View = 'list' | 'import'

export const VariantsPage = () => {
  const { user } = useAuth()
  const canEdit = user?.role === 'admin' || user?.role === 'manager'

  const [view, setView] = useState<View>('list')
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { sorted: sortedVariants, sortKey, sortDir, toggleSort } = useSort(
    variants,
    {
      sku: (v) => variantSKU(v),
      color: (v) => v.color?.name,
      size: (v) => v.size?.label,
      product: (v) => v.product_name,
      stock: (v) => v.stock,
    }
  )

  const fetchVariants = async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      setError(null)
      const data = await variantService.listVariants()
      if (!signal?.aborted) setVariants(data || [])
    } catch (err) {
      if (signal?.aborted) return
      setError(err instanceof Error ? err.message : 'Error al cargar las variantes')
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchVariants(controller.signal)
    return () => controller.abort()
  }, [])

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    fetchVariants()
  }

  const handleImportSuccess = () => {
    fetchVariants()
    setView('list')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Variantes</h1>
        <p className="mt-2 text-muted-foreground">
          Gestiona las variantes de productos
        </p>
      </div>

      {/* List View */}
      {view === 'list' && (
        <>
          {/* Actions */}
          {canEdit && (
            <div className="mb-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setView('import')}>
                <Upload className="mr-2 h-4 w-4" />
                Importar CSV
              </Button>
              <Button size="sm" onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Variante
              </Button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <Card className="p-8">
              <div className="flex justify-center">
                <LoadingSpinner size="lg" />
              </div>
            </Card>
          )}

          {/* Error */}
          {!loading && error && (
            <Card className="p-8">
              <div className="text-center">
                <p className="mb-4 text-destructive">{error}</p>
                <Button variant="outline" onClick={() => fetchVariants()}>
                  Reintentar
                </Button>
              </div>
            </Card>
          )}

          {/* Empty */}
          {!loading && !error && variants.length === 0 && (
            <Card className="p-8">
              <div className="text-center">
                <p className="text-muted-foreground">No hay variantes registradas.</p>
                {canEdit && (
                  <Button
                    className="mt-4"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Crear primera variante
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Table */}
          {!loading && !error && variants.length > 0 && (
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHead label="SKU" sortKey="sku" activeKey={sortKey} direction={sortDir} onSort={toggleSort} />
                      <SortableHead label="Color" sortKey="color" activeKey={sortKey} direction={sortDir} onSort={toggleSort} />
                      <SortableHead label="Talla" sortKey="size" activeKey={sortKey} direction={sortDir} onSort={toggleSort} />
                      <SortableHead label="Producto" sortKey="product" activeKey={sortKey} direction={sortDir} onSort={toggleSort} />
                      <SortableHead label="Stock" sortKey="stock" activeKey={sortKey} direction={sortDir} onSort={toggleSort} align="right" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedVariants.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell className="font-mono text-sm">
                          {[variant.product_sku, variant.color?.sku, variant.size?.sku]
                            .filter(Boolean)
                            .join('-') || '—'}
                        </TableCell>
                        <TableCell className="font-medium">{variant.color?.name ?? '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{variant.size?.label ?? 'Sin talla'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {variant.product_name ?? <span className="italic">Sin asignar</span>}
                        </TableCell>
                        <TableCell className="text-right">{variant.stock}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Import View */}
      {view === 'import' && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Importar Variantes CSV</h2>
          </div>
          <VariantsCSVImport
            onSuccess={handleImportSuccess}
            onCancel={() => setView('list')}
          />
        </div>
      )}

      <VariantCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
