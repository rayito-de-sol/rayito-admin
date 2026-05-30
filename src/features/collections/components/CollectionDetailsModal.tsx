import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CollectionStateBadge } from './CollectionStateBadge'
import { formatColombiaCurrency } from '../utils/currency'
import { collectionsApi } from '../api/collectionsApi'
import type { Collection } from '../types/collection.types'
import { Loader2 } from 'lucide-react'

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
  const [fullCollection, setFullCollection] = useState<Collection | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const fetch = async () => {
      try {
        setIsLoading(true)
        const data = await collectionsApi.get(collection.id)
        setFullCollection(data)
      } catch {
        setFullCollection(collection)
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [isOpen, collection.id])

  const data = fullCollection ?? collection

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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* General info */}
            <div className="rounded-md border p-4">
              <h3 className="mb-3 font-semibold">Información General</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <div className="mt-1">
                    <CollectionStateBadge state={data.state} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de creación</p>
                  <p className="text-sm">{formatDate(data.created_at)}</p>
                </div>
                {data.payment_due_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de vencimiento</p>
                    <p className="text-sm">{formatDate(data.payment_due_date)}</p>
                  </div>
                )}
                {data.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Notas</p>
                    <p className="text-sm">{data.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="rounded-md border">
              <div className="border-b px-4 py-3">
                <h3 className="font-semibold">Productos</h3>
              </div>
              {data.items && data.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-2 text-left font-medium">Producto</th>
                        <th className="px-4 py-2 text-left font-medium">Color</th>
                        <th className="px-4 py-2 text-left font-medium">Talla</th>
                        <th className="px-4 py-2 text-left font-medium">SKU</th>
                        <th className="px-4 py-2 text-right font-medium">Cantidad</th>
                        <th className="px-4 py-2 text-right font-medium">P. Unitario</th>
                        <th className="px-4 py-2 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="px-4 py-2 font-medium">{item.product_name}</td>
                          <td className="px-4 py-2">{item.variant_color}</td>
                          <td className="px-4 py-2">{item.size_name || '-'}</td>
                          <td className="px-4 py-2 font-mono text-xs">{item.variant_sku}</td>
                          <td className="px-4 py-2 text-right">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">
                            {formatColombiaCurrency(item.unit_price_final)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {formatColombiaCurrency(item.unit_price_final * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No hay productos en esta cuenta de cobro
                </p>
              )}
            </div>

            {/* Pricing breakdown */}
            <div className="rounded-md border p-4">
              <h3 className="mb-3 font-semibold">Desglose de Precios</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal antes de descuento</span>
                  <span>{formatColombiaCurrency(data.subtotal_before_discount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Descuento ({data.discount_percentage}%)
                  </span>
                  <span className="text-destructive">
                    -{formatColombiaCurrency(data.discount_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal después de descuento</span>
                  <span>{formatColombiaCurrency(data.subtotal_after_discount)}</span>
                </div>
                {data.vat_deducted && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      IVA deducido ({data.vat_percentage * 100}%)
                    </span>
                    <span className="text-destructive">
                      -{formatColombiaCurrency(data.vat_amount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Total</span>
                  <span className="text-base">
                    {formatColombiaCurrency(data.total_price)} {data.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment details */}
            {data.state === 'paid' && (
              <div className="rounded-md border bg-green-50 p-4">
                <h3 className="mb-3 font-semibold text-green-900">Detalles de Pago</h3>
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <div>
                    <p className="text-green-700">Fecha de pago</p>
                    <p className="text-green-900">{formatDate(data.payment_received_at)}</p>
                  </div>
                  {data.payment_method && (
                    <div>
                      <p className="text-green-700">Método de pago</p>
                      <p className="text-green-900">{data.payment_method}</p>
                    </div>
                  )}
                  {data.payment_reference && (
                    <div className="md:col-span-2">
                      <p className="text-green-700">Referencia de pago</p>
                      <p className="text-green-900">{data.payment_reference}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cancellation details */}
            {data.state === 'cancelled' && (
              <div className="rounded-md border bg-red-50 p-4">
                <h3 className="mb-3 font-semibold text-red-900">Detalles de Cancelación</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-red-700">Fecha de cancelación</p>
                    <p className="text-red-900">{formatDate(data.cancelled_at)}</p>
                  </div>
                  {data.cancel_reason && (
                    <div>
                      <p className="text-red-700">Motivo</p>
                      <p className="text-red-900">{data.cancel_reason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
