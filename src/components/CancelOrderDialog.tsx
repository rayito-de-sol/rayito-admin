import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ordersService } from '@/services/ordersService'
import type { Order } from '@/types/order'
import { formatCurrency } from '@/utils/currency'
import { toast } from '@/utils/toast'
import { Loader2 } from 'lucide-react'

const MAX_REASON_LENGTH = 500

interface CancelOrderDialogProps {
  /** null = cerrado */
  order: Order | null
  onClose: () => void
  onSuccess: () => void
}

/**
 * CancelOrderDialog
 * Cancela un pedido: devuelve el stock y, si la venta fue a una tienda, cancela
 * también su cuenta de cobro.
 */
export const CancelOrderDialog = ({
  order,
  onClose,
  onSuccess,
}: CancelOrderDialogProps) => {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!order) return
    setReason('')
    setError(null)
  }, [order])

  const handleSubmit = async () => {
    if (!order) return
    setLoading(true)
    setError(null)
    try {
      await ordersService.cancelOrder(order.id, {
        cancel_reason: reason.trim() || undefined,
      })
      toast.success('Pedido cancelado')
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar el pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={!!order} onOpenChange={(next) => !next && !loading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar pedido</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {order && (
            <p className="text-sm text-muted-foreground">
              Se cancelará el pedido de {order.customer_name ?? 'cliente'} por{' '}
              {formatCurrency(order.total)} y se devolverá el stock.
              {order.collection_id && ' También se cancelará su cuenta de cobro.'}
            </p>
          )}

          <div>
            <Label htmlFor="cancel-reason" className="mb-2">
              Motivo (opcional)
            </Label>
            <textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON_LENGTH))}
              rows={3}
              className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Por qué se cancela el pedido"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {reason.length}/{MAX_REASON_LENGTH}
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Volver
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cancelar pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
