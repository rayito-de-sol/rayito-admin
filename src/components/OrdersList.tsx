import type { Order, OrderSource } from '@/types/order'
import {
  ORDER_SOURCE_LABELS,
  ORDER_STATE_LABELS,
  isOrderPaid,
  isOrderLocked,
} from '@/types/order'
import type { Customer } from '@/types/customer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { collectionsApi } from '@/features/collections/api/collectionsApi'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/utils/currency'
import { formatDateOnly, isPastDateOnly } from '@/utils/date'
import { toast } from '@/utils/toast'
import {
  Pencil,
  Trash2,
  MoreVertical,
  CheckCircle,
  Ban,
  FileText,
} from 'lucide-react'

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
  canEdit: boolean
  /** Nombres vivos de los clientes, por id */
  customersById: Map<string, Customer>
  onEdit: (order: Order) => void
  onDelete: (order: Order) => void
  onMarkPaid: (order: Order) => void
  onCancel: (order: Order) => void
  /** Filtros activos (pestaña de canal): al cambiar se vuelve a la primera página */
  resetPageOn: unknown[]
}

/**
 * Estado de pago del pedido: pagado, por cobrar o vencido.
 * No hay tokens de éxito ni de aviso en el tema, así que se usan las variantes
 * existentes: secondary para lo saldado y destructive para lo vencido.
 */
const PaymentCell = ({ order }: { order: Order }) => {
  if (order.state === 'cancelled') {
    return <span className="text-muted-foreground">—</span>
  }

  if (isOrderPaid(order)) {
    return <Badge variant="secondary">Pagado</Badge>
  }

  const overdue = !!order.payment_due_date && isPastDateOnly(order.payment_due_date)

  return (
    <div>
      <Badge variant={overdue ? 'destructive' : 'outline'}>
        {overdue ? 'Vencido' : 'Por cobrar'}
      </Badge>
      {order.payment_due_date && (
        <p
          className={cn(
            'mt-1 text-xs',
            overdue ? 'text-destructive' : 'text-muted-foreground'
          )}
        >
          Vence {formatDateOnly(order.payment_due_date)}
        </p>
      )}
    </div>
  )
}

/**
 * OrdersList
 * Tabla unificada de pedidos de todos los canales, con su estado de pago y las
 * acciones disponibles según ese estado.
 */
export const OrdersList = ({
  orders,
  loading,
  error,
  onRetry,
  canEdit,
  customersById,
  onEdit,
  onDelete,
  onMarkPaid,
  onCancel,
  resetPageOn,
}: OrdersListProps) => {
  const { pageItems, pagination } = usePagination(orders, resetPageOn)

  const openCollectionPdf = async (documentId: string) => {
    try {
      const url = await collectionsApi.getDocumentDownloadUrl(documentId)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Error al abrir la cuenta de cobro'
      )
    }
  }

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
        <p className="text-center text-sm text-muted-foreground">
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
            <TableHead>Cliente</TableHead>
            <TableHead>Artículos</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Pago</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map((order) => {
            const paid = isOrderPaid(order)
            const cancelled = order.state === 'cancelled'
            const locked = isOrderLocked(order)
            // Cobrar y cancelar también aplican a las ventas a tiendas:
            // el backend sincroniza la cuenta de cobro
            const canSettle = canEdit && !paid && !cancelled
            const canEditOrder = canEdit && !locked && !cancelled
            const canDelete = canEdit && !locked
            const hasActions = canSettle || canEditOrder || canDelete

            const customerName =
              (order.customer_id && customersById.get(order.customer_id)?.name) ||
              order.customer_name ||
              '—'

            return (
              <TableRow key={order.id}>
                <TableCell>
                  <Badge variant={SOURCE_BADGE_VARIANT[order.source]}>
                    {ORDER_SOURCE_LABELS[order.source]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{formatDate(order.order_date)}</TableCell>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-2">
                    <span>{customerName}</span>
                    {order.collection_document_id && (
                      <button
                        type="button"
                        onClick={() => openCollectionPdf(order.collection_document_id!)}
                        aria-label="Ver cuenta de cobro"
                        title="Ver cuenta de cobro"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{order.items?.length ?? '—'}</TableCell>
                <TableCell className="text-sm">{ORDER_STATE_LABELS[order.state]}</TableCell>
                <TableCell>
                  <PaymentCell order={order} />
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(order.total)}
                </TableCell>
                <TableCell>
                  {canEdit && hasActions && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
                        aria-label="Acciones del pedido"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canSettle && (
                          <>
                            <DropdownMenuItem onClick={() => onMarkPaid(order)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar pagado
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onCancel(order)}>
                              <Ban className="mr-2 h-4 w-4" />
                              Cancelar
                            </DropdownMenuItem>
                          </>
                        )}
                        {(canEditOrder || canDelete) && canSettle && <DropdownMenuSeparator />}
                        {canEditOrder && (
                          <DropdownMenuItem onClick={() => onEdit(order)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <DropdownMenuItem onClick={() => onDelete(order)}>
                            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                            Eliminar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <TablePagination {...pagination} />
    </Card>
  )
}
