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
import { TablePagination } from '@/components/TablePagination'
import { usePagination } from '@/hooks/usePagination'
import type { Customer, CustomerType } from '@/types/customer'

interface CustomersListProps {
  /** Ya filtrados por la pestaña activa */
  customers: Customer[]
  type: CustomerType
  loading: boolean
  error: string | null
  onCustomerClick: (customerId: string) => void
  onRetry: () => void
}

/**
 * CustomersList
 * Tabla de clientes. Las columnas cambian según el tipo: una persona solo tiene
 * identificación y contacto, una tienda además descuento.
 */
export const CustomersList = ({
  customers,
  type,
  loading,
  error,
  onCustomerClick,
  onRetry,
}: CustomersListProps) => {
  const isStore = type === 'store'
  // Al cambiar de pestaña (personas/tiendas) se vuelve a la primera página
  const { pageItems, pagination } = usePagination(customers, [type])

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    )
  }

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

  if (customers.length === 0) {
    return (
      <Card className="p-8">
        <p className="text-center text-muted-foreground">
          {isStore ? 'No hay tiendas registradas' : 'No hay personas registradas'}
        </p>
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Identificación</TableHead>
            {isStore && <TableHead>Contacto</TableHead>}
            <TableHead>Teléfono</TableHead>
            {isStore ? (
              <TableHead className="text-right">Descuento (%)</TableHead>
            ) : (
              <TableHead>Email</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map((customer) => (
            <TableRow
              key={customer.id}
              onClick={() => onCustomerClick(customer.id)}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>
                {customer.identity_number
                  ? `${customer.identity_type ?? ''} ${customer.identity_number}`.trim()
                  : '—'}
              </TableCell>
              {isStore && <TableCell>{customer.contact_person_name || '—'}</TableCell>}
              <TableCell>{customer.contact_phone_number || '—'}</TableCell>
              {isStore ? (
                <TableCell className="text-right">
                  {customer.discount_percentage}%
                </TableCell>
              ) : (
                <TableCell>{customer.contact_person_email || '—'}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination {...pagination} />
    </Card>
  )
}
