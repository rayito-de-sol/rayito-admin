import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FinalizeCollectionDialog } from './FinalizeCollectionDialog'
import { MarkAsPaidDialog } from './MarkAsPaidDialog'
import { CancelCollectionDialog } from './CancelCollectionDialog'
import { CollectionDetailsModal } from './CollectionDetailsModal'
import { EditCollectionModal } from './EditCollectionModal'
import type { Collection } from '../types/collection.types'
import { MoreVertical, Eye, Edit, CheckCircle, Ban, FileCheck } from 'lucide-react'

interface CollectionActionsProps {
  collection: Collection
  onUpdate?: () => void
}

type DialogType = 'details' | 'edit' | 'finalize' | 'paid' | 'cancel' | null

export const CollectionActions = ({
  collection,
  onUpdate,
}: CollectionActionsProps) => {
  const [openDialog, setOpenDialog] = useState<DialogType>(null)

  const isDraft = collection.state === 'draft'
  const isActive = collection.state === 'active'
  const isPaid = collection.state === 'paid'
  const isCancelled = collection.state === 'cancelled'
  const isTerminal = isPaid || isCancelled

  const handleClose = () => setOpenDialog(null)

  const handleSuccess = () => {
    setOpenDialog(null)
    onUpdate?.()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
        >
          <MoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpenDialog('details')}>
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles
          </DropdownMenuItem>

          {isDraft && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpenDialog('edit')}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenDialog('finalize')}>
                <FileCheck className="mr-2 h-4 w-4" />
                Finalizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenDialog('cancel')}>
                <Ban className="mr-2 h-4 w-4" />
                Cancelar
              </DropdownMenuItem>
            </>
          )}

          {isActive && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpenDialog('paid')}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Marcar como pagado
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpenDialog('cancel')}>
                <Ban className="mr-2 h-4 w-4" />
                Cancelar
              </DropdownMenuItem>
            </>
          )}

          {isTerminal && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              No hay acciones disponibles
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Only mount dialogs when they're needed */}
      {openDialog === 'details' && (
        <CollectionDetailsModal
          collection={collection}
          isOpen
          onClose={handleClose}
        />
      )}
      {openDialog === 'edit' && (
        <EditCollectionModal
          collection={collection}
          isOpen
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}
      {openDialog === 'finalize' && (
        <FinalizeCollectionDialog
          collectionId={collection.id}
          isOpen
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}
      {openDialog === 'paid' && (
        <MarkAsPaidDialog
          collectionId={collection.id}
          isOpen
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}
      {openDialog === 'cancel' && (
        <CancelCollectionDialog
          collectionId={collection.id}
          isOpen
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
