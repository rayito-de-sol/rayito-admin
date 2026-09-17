import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ordersService } from '@/services/ordersService'
import type { Order } from '@/types/order'
import { formatCurrency } from '@/utils/currency'
import { toast } from '@/utils/toast'
import { Loader2 } from 'lucide-react'

const PAYMENT_METHODS = [
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'otro', label: 'Otro' },
]

interface MarkOrderPaidDialogProps {
  /** null = cerrado */
  order: Order | null
  onClose: () => void
  onSuccess: () => void
}

/**
 * MarkOrderPaidDialog
 * Registra el pago de un pedido. Si la venta fue a una tienda, el backend marca
 * también como pagada su cuenta de cobro.
 */
export const MarkOrderPaidDialog = ({
  order,
  onClose,
  onSuccess,
}: MarkOrderPaidDialogProps) => {
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!order) return
    setPaymentMethod('')
    setPaymentReference('')
    setError(null)
  }, [order])

  const handleSubmit = async () => {
    if (!order) return
    setLoading(true)
    setError(null)
    try {
      await ordersService.payOrder(order.id, {
        payment_method: paymentMethod || undefined,
        payment_reference: paymentReference || undefined,
      })
      toast.success('Pago registrado')
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar el pago')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={!!order} onOpenChange={(next) => !next && !loading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar pago</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {order && (
            <p className="text-sm text-muted-foreground">
              Pedido de {order.customer_name ?? 'cliente'} por{' '}
              {formatCurrency(order.total)}.
            </p>
          )}

          <div>
            <Label htmlFor="order-payment-method" className="mb-2">
              Método de pago
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="order-payment-method">
                <SelectValue placeholder="Seleccionar método" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="order-payment-reference" className="mb-2">
              Referencia
            </Label>
            <Input
              id="order-payment-reference"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Número de transferencia, recibo..."
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
