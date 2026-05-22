import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CollectionStateBadge } from './CollectionStateBadge'
import { formatColombiaCurrency } from '../utils/currency'
import type { Collection } from '../types/collection.types'
import { X } from 'lucide-react'

interface CollectionDetailsModalProps {
  collection: Collection
  isOpen: boolean
  onClose: () => void
}

export const CollectionDetailsModal = ({
  collection,
  isOpen,
  onClose,
}: CollectionDetailsModalProps) => {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Cuenta de Cobro #{collection.collection_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metadata Section */}
          <div className="rounded-md border p-4">
            <h3 className="mb-3 font-semibold">Información General</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <div className="mt-1">
                  <CollectionStateBadge state={collection.state} />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de creación</p>
                <p className="text-base">{formatDate(collection.created_at)}</p>
              </div>
              {collection.payment_due_date && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Fecha de vencimiento
                  </p>
                  <p className="text-base">
                    {formatDate(collection.payment_due_date)}
                  </p>
                </div>
              )}
              {collection.notes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p className="text-base">{collection.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items Section */}
          <div className="rounded-md border">
            <div className="border-b p-4">
              <h3 className="font-semibold">Productos</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Talla</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Precio Original</TableHead>
                  <TableHead className="text-right">Precio Final</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collection.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.product_name}
                    </TableCell>
                    <TableCell>{item.variant_color}</TableCell>
                    <TableCell>{item.size_name || '-'}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {item.variant_sku}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatColombiaCurrency(item.unit_price_original)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatColombiaCurrency(item.unit_price_final)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pricing Breakdown Section */}
          <div className="rounded-md border p-4">
            <h3 className="mb-3 font-semibold">Desglose de Precios</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Subtotal antes de descuento
                </span>
                <span className="font-medium">
                  {formatColombiaCurrency(collection.subtotal_before_discount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Descuento ({collection.discount_percentage}%)
                </span>
                <span className="text-destructive">
                  -{formatColombiaCurrency(collection.discount_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Subtotal después de descuento
                </span>
                <span className="font-medium">
                  {formatColombiaCurrency(collection.subtotal_after_discount)}
                </span>
              </div>
              {collection.vat_deducted && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    IVA deducido ({collection.vat_percentage * 100}%)
                  </span>
                  <span className="text-destructive">
                    -{formatColombiaCurrency(collection.vat_amount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold">
                  {formatColombiaCurrency(collection.total_price)}{' '}
                  {collection.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Details (if paid) */}
          {collection.state === 'paid' && (
            <div className="rounded-md border bg-green-50 p-4">
              <h3 className="mb-3 font-semibold text-green-900">
                Detalles de Pago
              </h3>
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <p className="text-sm text-green-700">Fecha de pago</p>
                  <p className="text-base text-green-900">
                    {formatDate(collection.payment_received_at)}
                  </p>
                </div>
                {collection.payment_method && (
                  <div>
                    <p className="text-sm text-green-700">Método de pago</p>
                    <p className="text-base text-green-900">
                      {collection.payment_method}
                    </p>
                  </div>
                )}
                {collection.payment_reference && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-green-700">
                      Referencia de pago
                    </p>
                    <p className="text-base text-green-900">
                      {collection.payment_reference}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cancellation Details (if cancelled) */}
          {collection.state === 'cancelled' && (
            <div className="rounded-md border bg-red-50 p-4">
              <h3 className="mb-3 font-semibold text-red-900">
                Detalles de Cancelación
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-red-700">Fecha de cancelación</p>
                  <p className="text-base text-red-900">
                    {formatDate(collection.cancelled_at)}
                  </p>
                </div>
                {collection.cancel_reason && (
                  <div>
                    <p className="text-sm text-red-700">Motivo</p>
                    <p className="text-base text-red-900">
                      {collection.cancel_reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
