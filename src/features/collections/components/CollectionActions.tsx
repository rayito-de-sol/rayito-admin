import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
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

  const handleDialogClose = () => {
    setOpenDialog(null)
  }

  const handleSuccess = () => {
    setOpenDialog(null)
    onUpdate?.()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* View Details - Available for all states */}
          <DropdownMenuItem onClick={() => setOpenDialog('details')}>
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles
          </DropdownMenuItem>

          {/* Draft Actions */}
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

          {/* Active Actions */}
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

          {/* Terminal States - Only View Details */}
          {isTerminal && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              No hay acciones disponibles
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      <CollectionDetailsModal
        collection={collection}
        isOpen={openDialog === 'details'}
        onClose={handleDialogClose}
      />

      <EditCollectionModal
        collection={collection}
        isOpen={openDialog === 'edit'}
        onClose={handleDialogClose}
        onSuccess={handleSuccess}
      />

      <FinalizeCollectionDialog
        collectionId={collection.id}
        isOpen={openDialog === 'finalize'}
        onClose={handleDialogClose}
        onSuccess={handleSuccess}
      />

      <MarkAsPaidDialog
        collectionId={collection.id}
        isOpen={openDialog === 'paid'}
        onClose={handleDialogClose}
        onSuccess={handleSuccess}
      />

      <CancelCollectionDialog
        collectionId={collection.id}
        isOpen={openDialog === 'cancel'}
        onClose={handleDialogClose}
        onSuccess={handleSuccess}
      />
    </>
  )
}
