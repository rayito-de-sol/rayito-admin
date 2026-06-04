import type { Order, OrderSource } from '@/types/order'
import { ORDER_SOURCE_LABELS, ORDER_STATE_LABELS } from '@/types/order'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/currency'

const SOURCE_BADGE_VARIANT: Record<OrderSource, 'default' | 'secondary' | 'outline'> = {
  store: 'default',
  shopify: 'secondary',
  whatsapp: 'outline',
}

interface OrdersListProps {
  orders: Order[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

/**
 * OrdersList component
 * Unified table of orders from all channels with source badge, state, total, and date
 */
export const OrdersList = ({ orders, loading, error, onRetry }: OrdersListProps) => {
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
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Reintentar
        </Button>
      </Card>
    )
  }

  if (orders.length === 0) {
    return (
      <Card className="p-8">
        <p className="text-center text-sm text-[var(--color-muted-foreground)]">
          No hay pedidos registrados
        </p>
      </Card>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Canal</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente / Tienda</TableHead>
            <TableHead>Artículos</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Badge variant={SOURCE_BADGE_VARIANT[order.source]}>
                  {ORDER_SOURCE_LABELS[order.source]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">{formatDate(order.order_date)}</TableCell>
              <TableCell className="text-sm">
                {order.customer_name ?? order.store_id ?? '—'}
              </TableCell>
              <TableCell className="text-sm">{order.items?.length ?? '—'}</TableCell>
              <TableCell className="text-sm">{ORDER_STATE_LABELS[order.state]}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(order.total)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
