import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CollectionStateBadge } from './CollectionStateBadge'
import { CollectionActions } from './CollectionActions'
import { useCollections } from '../hooks/useCollections'
import { getGoogleDriveUrl } from '../utils/googleDrive'
import { formatColombiaCurrency } from '../utils/currency'
import type { CollectionState } from '../types/collection.types'
import { Plus, FileText, ArrowUpDown, Loader2 } from 'lucide-react'

interface CollectionsTableProps {
  storeId: string
  onCreateClick: () => void
}

type SortField = 'collection_number' | 'created_at'
type SortDirection = 'asc' | 'desc'

export const CollectionsTable = ({
  storeId,
  onCreateClick,
}: CollectionsTableProps) => {
  const [stateFilter, setStateFilter] = useState<CollectionState | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const { collections, isLoading, error, refetch } = useCollections(storeId, {
    state: stateFilter === 'all' ? undefined : stateFilter,
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedCollections = useMemo(() => {
    const sorted = [...collections]

    sorted.sort((a, b) => {
      let aValue: number | string
      let bValue: number | string

      if (sortField === 'collection_number') {
        aValue = a.collection_number
        bValue = b.collection_number
      } else {
        aValue = new Date(a.created_at).getTime()
        bValue = new Date(b.created_at).getTime()
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [collections, sortField, sortDirection])

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const hasPDF = (collection: any): boolean => {
    return (
      collection.document_id &&
      (collection.state === 'active' ||
        collection.state === 'paid' ||
        collection.state === 'cancelled')
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cuentas de Cobro</h2>
        <Button onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Crear cuenta de cobro
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="w-[200px]">
          <Select
            value={stateFilter}
            onValueChange={(value) => setStateFilter(value as CollectionState | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="paid">Pagado</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-6 text-center">
          <div className="mb-4 text-sm text-destructive">{error}</div>
          <Button variant="outline" onClick={refetch}>
            Reintentar
          </Button>
        </div>
      )}

      {!isLoading && !error && sortedCollections.length === 0 && (
        <div className="rounded-md border border-dashed p-12 text-center">
          <div className="text-sm text-muted-foreground">
            {stateFilter === 'all'
              ? 'No hay cuentas de cobro. Crea la primera cuenta de cobro para este comercio.'
              : 'No hay cuentas de cobro con este estado.'}
          </div>
        </div>
      )}

      {!isLoading && !error && sortedCollections.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('collection_number')}
                    className="font-medium"
                  >
                    No.
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('created_at')}
                    className="font-medium"
                  >
                    Fecha
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>PDF</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCollections.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell className="font-medium">
                    {collection.collection_number}
                  </TableCell>
                  <TableCell>{formatDate(collection.created_at)}</TableCell>
                  <TableCell>
                    {formatColombiaCurrency(collection.total_price)}
                  </TableCell>
                  <TableCell>
                    <CollectionStateBadge state={collection.state} />
                  </TableCell>
                  <TableCell>
                    {hasPDF(collection) ? (
                      <a
                        href={getGoogleDriveUrl(collection.document_id!)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <CollectionActions collection={collection} onUpdate={refetch} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
