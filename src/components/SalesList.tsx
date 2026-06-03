import type { Sale, SaleSource } from '@/types/sale'
import { SALE_SOURCE_LABELS, SALE_STATE_LABELS } from '@/types/sale'
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

const SOURCE_BADGE_VARIANT: Record<SaleSource, 'default' | 'secondary' | 'outline'> = {
  store: 'default',
  shopify: 'secondary',
  whatsapp: 'outline',
}

interface SalesListProps {
  sales: Sale[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

/**
 * SalesList component
 * Unified table of sales from all channels with source badge, state, total, and date
 */
export const SalesList = ({ sales, loading, error, onRetry }: SalesListProps) => {
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

  if (sales.length === 0) {
    return (
      <Card className="p-8">
        <p className="text-center text-sm text-[var(--color-muted-foreground)]">
          No hay ventas registradas
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
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>
                <Badge variant={SOURCE_BADGE_VARIANT[sale.source]}>
                  {SALE_SOURCE_LABELS[sale.source]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">{formatDate(sale.sale_date)}</TableCell>
              <TableCell className="text-sm">
                {sale.customer_name ?? sale.store_id ?? '—'}
              </TableCell>
              <TableCell className="text-sm">{sale.items?.length ?? '—'}</TableCell>
              <TableCell className="text-sm">{SALE_STATE_LABELS[sale.state]}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(sale.total)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
