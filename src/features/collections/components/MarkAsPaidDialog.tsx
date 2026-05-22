import { useState } from 'react'
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
import { useUpdateCollectionState } from '../hooks/useUpdateCollectionState'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface MarkAsPaidDialogProps {
  collectionId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const MarkAsPaidDialog = ({
  collectionId,
  isOpen,
  onClose,
  onSuccess,
}: MarkAsPaidDialogProps) => {
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { updateState, isLoading } = useUpdateCollectionState()

  const handleSubmit = async () => {
    // Validate payment method
    if (!paymentMethod) {
      setError('Seleccione un método de pago')
      return
    }

    try {
      setError(null)
      await updateState(collectionId, {
        state: 'paid',
        payment_method: paymentMethod,
        payment_reference: paymentReference || undefined,
      })
      toast.success('Cuenta de cobro marcada como pagada')
      handleClose()
      onSuccess?.()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al actualizar estado'
      setError(message)
      toast.error(message)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setPaymentMethod('')
      setPaymentReference('')
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marcar como Pagado</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="payment_method" className="mb-2">
              Método de pago *
            </Label>
            <Select
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value || '')}
              disabled={isLoading}
            >
              <SelectTrigger id="payment_method">
                <SelectValue placeholder="Seleccione método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="payment_reference" className="mb-2">
              Referencia de pago (opcional)
            </Label>
            <Input
              id="payment_reference"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              disabled={isLoading}
              placeholder="ID de transferencia, número de recibo, etc."
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Marcar como pagado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
