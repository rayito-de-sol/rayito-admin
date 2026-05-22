import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useUpdateCollectionState } from '../hooks/useUpdateCollectionState'
import { toast } from 'sonner'
import { Loader2, AlertCircle } from 'lucide-react'

interface FinalizeCollectionDialogProps {
  collectionId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const FinalizeCollectionDialog = ({
  collectionId,
  isOpen,
  onClose,
  onSuccess,
}: FinalizeCollectionDialogProps) => {
  const [error, setError] = useState<string | null>(null)
  const { finalize, isLoading } = useUpdateCollectionState()

  const handleConfirm = async () => {
    try {
      setError(null)
      await finalize(collectionId)
      toast.success('Cuenta de cobro finalizada exitosamente')
      onSuccess?.()
      onClose()
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error al finalizar cuenta de cobro'
      setError(message)
      toast.error(`Error al finalizar: ${message}`)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalizar Cuenta de Cobro</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-md bg-secondary p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <div className="text-sm">
              <p className="font-medium">
                ¿Finalizar esta cuenta de cobro?
              </p>
              <p className="mt-1 text-muted-foreground">
                Se generará el PDF y no podrá editarse. El documento quedará en
                estado "Activo".
              </p>
            </div>
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
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Finalizar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
