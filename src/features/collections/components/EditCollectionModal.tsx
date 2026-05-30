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
import { collectionsApi } from '../api/collectionsApi'
import { useCollectionsStore } from '../store/collectionsStore'
import { variantService } from '@/services/variantService'
import { formatColombiaCurrency } from '../utils/currency'
import { toast } from 'sonner'
import type { Collection } from '../types/collection.types'
import type { Variant } from '@/types/variant'
import { Loader2, Search } from 'lucide-react'

interface EditCollectionModalProps {
  collection: Collection
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const EditCollectionModal = ({
  collection,
  isOpen,
  onClose,
  onSuccess,
}: EditCollectionModalProps) => {
  const [variants, setVariants] = useState<Variant[]>([])
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [search, setSearch] = useState('')
  const [notes, setNotes] = useState('')
  const [notesError, setNotesError] = useState('')
  const [paymentDueDate, setPaymentDueDate] = useState('')
  const [dueDateError, setDueDateError] = useState('')
  const [formError, setFormError] = useState('')
  const [isLoadingVariants, setIsLoadingVariants] = useState(false)
  const [variantsError, setVariantsError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { updateCollection } = useCollectionsStore()

  useEffect(() => {
    if (!isOpen) return

    const fetchVariants = async () => {
      try {
        setIsLoadingVariants(true)
        setVariantsError('')
        const data = await variantService.listVariants()
        setVariants(data)

        // Pre-populate quantities from existing collection items
        const initialQuantities: Record<string, number> = {}
        collection.items?.forEach((item) => {
          initialQuantities[item.variant_id] = item.quantity
        })
        setQuantities(initialQuantities)
      } catch (err) {
        setVariantsError(
          err instanceof Error ? err.message : 'Error al cargar productos'
        )
      } finally {
        setIsLoadingVariants(false)
      }
    }

    setNotes(collection.notes ?? '')
    setPaymentDueDate(
      collection.payment_due_date ? collection.payment_due_date.split('T')[0] ?? '' : ''
    )
    fetchVariants()
  }, [isOpen, collection])

  const filteredVariants = variants.filter((v) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (v.product_name?.toLowerCase() ?? '').includes(q) ||
      v.color.toLowerCase().includes(q) ||
      v.sku.toLowerCase().includes(q) ||
      (v.size?.label.toLowerCase() ?? '').includes(q)
    )
  })

  const selectedItems = variants.filter((v) => (quantities[v.id] ?? 0) > 0)

  const handleQuantityChange = (variantId: string, value: string) => {
    const num = parseInt(value, 10)
    setQuantities((prev) => ({
      ...prev,
      [variantId]: isNaN(num) || num < 0 ? 0 : num,
    }))
    setFormError('')
  }

  const handleNotesChange = (value: string) => {
    setNotes(value)
    setNotesError(
      value.length > 500 ? 'Las notas no pueden exceder 500 caracteres' : ''
    )
  }

  const handleDueDateChange = (value: string) => {
    setPaymentDueDate(value)
    if (!value) {
      setDueDateError('')
      return
    }
    const selected = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
    if (selected < today) {
      setDueDateError('La fecha de vencimiento debe ser futura')
    } else if (selected > oneYearFromNow) {
      setDueDateError('La fecha de vencimiento no puede ser mayor a 1 año')
    } else {
      setDueDateError('')
    }
  }

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      setFormError('Debe agregar al menos un producto con cantidad mayor a cero')
      return
    }
    if (notesError || dueDateError) return

    const withoutPrice = selectedItems.filter((v) => !v.product_price)
    if (withoutPrice.length > 0) {
      const names = withoutPrice.map((v) => v.product_name ?? v.sku).join(', ')
      setFormError(`Los siguientes productos no tienen precio definido: ${names}`)
      return
    }

    try {
      setIsLoading(true)
      setFormError('')

      const updatedCollection = await collectionsApi.updateItems(collection.id, {
        items: selectedItems.map((v) => ({
          variant_id: v.id,
          quantity: quantities[v.id] ?? 0,
        })),
      })

      const notesChanged = notes !== (collection.notes || '')
      const dueDateChanged =
        paymentDueDate !== (collection.payment_due_date?.split('T')[0] || '')

      if (notesChanged || dueDateChanged) {
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
      setFormError(
        err instanceof Error ? err.message : 'Error al actualizar cuenta de cobro'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setSearch('')
      setFormError('')
      onClose()
    }
  }

  const isFormValid = selectedItems.length > 0 && !notesError && !dueDateError

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar Cuenta de Cobro #{collection.collection_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Variant list */}
          <div>
            <Label className="mb-2">Productos</Label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, color, talla, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                disabled={isLoading}
              />
            </div>

            {isLoadingVariants && (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando productos...
              </div>
            )}

            {variantsError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {variantsError}
              </div>
            )}

            {!isLoadingVariants && !variantsError && (
              <div className="rounded-md border overflow-hidden">
                {filteredVariants.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {search ? 'No se encontraron productos' : 'No hay productos disponibles'}
                  </div>
                ) : (
                  <div className="divide-y max-h-[320px] overflow-y-auto">
                    {filteredVariants.map((variant) => (
                      <div
                        key={variant.id}
                        className={`flex items-center gap-3 px-4 py-3 ${
                          (quantities[variant.id] ?? 0) > 0 ? 'bg-secondary/50' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {variant.product_name} - {variant.color}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {variant.size?.label && `${variant.size.label} • `}
                            SKU: {variant.sku}
                            {variant.current_cost !== undefined && (
                              <> • {formatColombiaCurrency(variant.current_cost)}</>
                            )}
                          </div>
                        </div>
                        <div className="w-24 shrink-0">
                          <Input
                            type="number"
                            min="0"
                            value={quantities[variant.id] ?? 0}
                            onChange={(e) =>
                              handleQuantityChange(variant.id, e.target.value)
                            }
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedItems.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {selectedItems.length}{' '}
                {selectedItems.length === 1 ? 'producto seleccionado' : 'productos seleccionados'}
              </p>
            )}
          </div>

          {/* Optional details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-notes" className="mb-2">
                Notas (opcional)
              </Label>
              <textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                disabled={isLoading}
                className={`flex min-h-[80px] w-full rounded-md border ${
                  notesError ? 'border-destructive' : 'border-input'
                } bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50`}
                placeholder="Agregar notas internas..."
              />
              <div className="mt-1 text-xs">
                <span className={notesError ? 'text-destructive' : 'text-muted-foreground'}>
                  {notesError || `${notes.length}/500 caracteres`}
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-payment-due-date" className="mb-2">
                Fecha de vencimiento (opcional)
              </Label>
              <Input
                id="edit-payment-due-date"
                type="date"
                value={paymentDueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                disabled={isLoading}
                className={dueDateError ? 'border-destructive' : ''}
              />
              {dueDateError && (
                <div className="mt-1 text-xs text-destructive">{dueDateError}</div>
              )}
            </div>
          </div>

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
