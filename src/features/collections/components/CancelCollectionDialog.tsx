import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useUpdateCollectionState } from '../hooks/useUpdateCollectionState'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface CancelCollectionDialogProps {
  collectionId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const CancelCollectionDialog = ({
  collectionId,
  isOpen,
  onClose,
  onSuccess,
}: CancelCollectionDialogProps) => {
  const [cancelReason, setCancelReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { updateState, isLoading } = useUpdateCollectionState()

  const handleSubmit = async () => {
    // Validate cancel reason
    if (!cancelReason.trim()) {
      setError('Ingrese el motivo de cancelación')
      return
    }

    if (cancelReason.length > 500) {
      setError('El motivo no puede exceder 500 caracteres')
      return
    }

    try {
      setError(null)
      await updateState(collectionId, {
        state: 'cancelled',
        cancel_reason: cancelReason,
      })
      toast.success('Cuenta de cobro cancelada')
      handleClose()
      onSuccess?.()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al cancelar cuenta de cobro'
      setError(message)
      toast.error(message)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setCancelReason('')
      setError(null)
      onClose()
    }
  }

  const handleReasonChange = (value: string) => {
    setCancelReason(value)
    if (error) {
      setError(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Cuenta de Cobro</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="cancel_reason" className="mb-2">
              Motivo de cancelación *
            </Label>
            <textarea
              id="cancel_reason"
              value={cancelReason}
              onChange={(e) => handleReasonChange(e.target.value)}
              disabled={isLoading}
              className={`flex min-h-[100px] w-full rounded-md border ${
                error ? 'border-destructive' : 'border-input'
              } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
              placeholder="Explique por qué se cancela esta cuenta de cobro..."
            />
            <div className="mt-1 flex justify-between text-xs">
              <span
                className={
                  error ? 'text-destructive' : 'text-muted-foreground'
                }
              >
                {error || `${cancelReason.length}/500 caracteres`}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Volver
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cancelar cuenta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
