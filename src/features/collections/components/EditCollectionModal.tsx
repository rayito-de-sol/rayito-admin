import { useState, useEffect } from 'react'
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
import { ProductSelector } from './ProductSelector'
import { collectionsApi } from '../api/collectionsApi'
import { useCollectionsStore } from '../store/collectionsStore'
import { toast } from 'sonner'
import type { Collection } from '../types/collection.types'
import type { Variant } from '@/types/variant'
import { Trash2, Loader2 } from 'lucide-react'

interface EditCollectionModalProps {
  collection: Collection
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface CollectionFormItem {
  variant_id: string
  product_name: string
  variant_color: string
  variant_sku: string
  size_name?: string
  quantity: number
  quantityError?: string
}

export const EditCollectionModal = ({
  collection,
  isOpen,
  onClose,
  onSuccess,
}: EditCollectionModalProps) => {
  const [items, setItems] = useState<CollectionFormItem[]>([])
  const [notes, setNotes] = useState('')
  const [notesError, setNotesError] = useState('')
  const [paymentDueDate, setPaymentDueDate] = useState('')
  const [dueDateError, setDueDateError] = useState('')
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { updateCollection } = useCollectionsStore()

  // Pre-fill form with collection data
  useEffect(() => {
    if (isOpen && collection) {
      setItems(
        collection.items?.map((item) => ({
          variant_id: item.variant_id,
          product_name: item.product_name,
          variant_color: item.variant_color,
          variant_sku: item.variant_sku,
          size_name: item.size_name,
          quantity: item.quantity,
        })) || []
      )
      setNotes(collection.notes ?? '')
      setPaymentDueDate(
        collection.payment_due_date
          ? collection.payment_due_date.split('T')[0] ?? ''
          : ''
      )
    }
  }, [isOpen, collection])

  const handleAddVariant = (variant: Variant) => {
    setItems((prev) => [
      ...prev,
      {
        variant_id: variant.id,
        product_name: variant.product_name || '',
        variant_color: variant.color,
        variant_sku: variant.sku,
        size_name: variant.size?.label,
        quantity: 1,
      },
    ])
    setFormError('')
  }

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleQuantityChange = (index: number, value: string) => {
    const numValue = parseInt(value, 10)

    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item

        let error: string | undefined

        if (isNaN(numValue) || numValue <= 0) {
          error = 'La cantidad debe ser mayor a cero'
        } else if (!Number.isInteger(numValue)) {
          error = 'La cantidad debe ser un número entero'
        }

        return {
          ...item,
          quantity: isNaN(numValue) ? 1 : numValue,
          quantityError: error,
        }
      })
    )
  }

  const handleNotesChange = (value: string) => {
    setNotes(value)

    if (value.length > 500) {
      setNotesError('Las notas no pueden exceder 500 caracteres')
    } else {
      setNotesError('')
    }
  }

  const handleDueDateChange = (value: string) => {
    setPaymentDueDate(value)

    if (!value) {
      setDueDateError('')
      return
    }

    const selectedDate = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

    if (selectedDate < today) {
      setDueDateError('La fecha de vencimiento debe ser futura')
    } else if (selectedDate > oneYearFromNow) {
      setDueDateError('La fecha de vencimiento no puede ser mayor a 1 año')
    } else {
      setDueDateError('')
    }
  }

  const validateForm = (): boolean => {
    if (items.length === 0) {
      setFormError('Debe agregar al menos un producto')
      return false
    }

    const hasQuantityErrors = items.some((item) => item.quantityError)
    if (hasQuantityErrors) {
      setFormError('Corrija los errores de cantidad antes de continuar')
      return false
    }

    if (notesError || dueDateError) {
      return false
    }

    setFormError('')
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setIsLoading(true)
      setFormError('')

      // Update items
      const updatedCollection = await collectionsApi.updateItems(collection.id, {
        items: items.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
        })),
      })

      // Update metadata if changed
      if (
        notes !== (collection.notes || '') ||
        paymentDueDate !== (collection.payment_due_date?.split('T')[0] || '')
      ) {
        await collectionsApi.updateMetadata(collection.id, {
          notes: notes || undefined,
          payment_due_date: paymentDueDate || undefined,
        })
      }

      updateCollection(collection.id, updatedCollection)
      toast.success('Cuenta de cobro actualizada exitosamente')
      handleClose()
      onSuccess?.()
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error al actualizar cuenta de cobro'
      setFormError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormError('')
      onClose()
    }
  }

  const isFormValid =
    items.length > 0 &&
    !items.some((item) => item.quantityError) &&
    !notesError &&
    !dueDateError

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar Cuenta de Cobro #{collection.collection_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Products Section */}
          <div>
            <Label className="mb-2">Productos *</Label>
            <ProductSelector
              onSelect={handleAddVariant}
              selectedVariantIds={items.map((item) => item.variant_id)}
              disabled={isLoading}
            />

            {/* Items List */}
            {items.length > 0 && (
              <div className="mt-4 space-y-2">
                {items.map((item, index) => (
                  <div
                    key={`${item.variant_id}-${index}`}
                    className="flex items-center gap-2 rounded-md border p-3"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {item.product_name} - {item.variant_color}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.size_name && `${item.size_name} • `}
                        SKU: {item.variant_sku}
                      </div>
                    </div>

                    <div className="w-24">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(index, e.target.value)
                        }
                        disabled={isLoading}
                        className={
                          item.quantityError ? 'border-destructive' : ''
                        }
                      />
                      {item.quantityError && (
                        <div className="mt-1 text-xs text-destructive">
                          {item.quantityError}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optional Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes" className="mb-2">
                Notas (opcional)
              </Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                disabled={isLoading}
                className={`flex min-h-[80px] w-full rounded-md border ${
                  notesError ? 'border-destructive' : 'border-input'
                } bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                placeholder="Agregar notas internas..."
              />
              <div className="mt-1 flex justify-between text-xs">
                <span
                  className={
                    notesError ? 'text-destructive' : 'text-muted-foreground'
                  }
                >
                  {notesError || `${notes.length}/500 caracteres`}
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="payment_due_date" className="mb-2">
                Fecha de vencimiento (opcional)
              </Label>
              <Input
                id="payment_due_date"
                type="date"
                value={paymentDueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                disabled={isLoading}
                className={dueDateError ? 'border-destructive' : ''}
              />
              {dueDateError && (
                <div className="mt-1 text-xs text-destructive">
                  {dueDateError}
                </div>
              )}
            </div>
          </div>

          {/* Form Error */}
          {formError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {formError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
