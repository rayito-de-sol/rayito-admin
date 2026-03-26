import { Store } from '@/types/store'
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
import { Plus } from 'lucide-react'

interface StoresListProps {
  stores: Store[]
  loading: boolean
  error: string | null
  onStoreClick: (storeId: string) => void
  onCreateClick: () => void
  onRetry: () => void
}

/**
 * StoresList component
 * Displays all stores in a table with loading, empty, and error states
 */
export const StoresList = ({
  stores,
  loading,
  error,
  onStoreClick,
  onCreateClick,
  onRetry,
}: StoresListProps) => {
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

  // Empty state
  if (stores.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">
            No hay tiendas registradas
          </p>
          <Button onClick={onCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Tienda
          </Button>
        </div>
      </Card>
    )
  }

  // Table with stores
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tienda
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número de Identificación</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead className="text-right">Descuento (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => (
              <TableRow
                key={store.id}
                onClick={() => onStoreClick(store.id)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  {store.identity_number}
                </TableCell>
                <TableCell>{store.name}</TableCell>
                <TableCell>{store.contact_person_name}</TableCell>
                <TableCell>{store.contact_phone_number}</TableCell>
                <TableCell className="text-right">
                  {store.discount_percentage}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
