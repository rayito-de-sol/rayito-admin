import { useState, useEffect, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ordersService } from '@/services/ordersService'
import { variantService } from '@/services/variantService'
import type { Variant } from '@/types/variant'
import type { Order, UpdateOrderRequest, OrderSource } from '@/types/order'
import { ORDER_SOURCE_LABELS } from '@/types/order'
import { toast } from '@/utils/toast'
import { Trash2, Plus } from 'lucide-react'

// Canales disponibles para entrada manual (store se excluye: viene de cuentas de cobro)
const MANUAL_SOURCES: { value: OrderSource; label: string }[] = [
  { value: 'whatsapp', label: ORDER_SOURCE_LABELS.whatsapp },
  { value: 'shopify', label: ORDER_SOURCE_LABELS.shopify },
]

interface LineItem {
  variantId: string
  quantity: number
}

interface ManualOrderModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  order?: Order | null // null/undefined = crear, con valor = editar
}

/**
 * ManualOrderModal
 * Form to record or edit a manual order (WhatsApp, Shopify).
 * In edit mode, items from historical imports (no variant link) are locked:
 * only the order details can be changed and items are omitted from the request.
 */
export const ManualOrderModal = ({ open, onClose, onSuccess, order }: ManualOrderModalProps) => {
  const isEdit = !!order

  const [source, setSource] = useState<OrderSource>('whatsapp')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<LineItem[]>([{ variantId: '', quantity: 1 }])
  const [itemsLocked, setItemsLocked] = useState(false)
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    variantService.listVariants().then(setVariants).catch(() => {})
  }, [open])

  // En modo edición, cargar el pedido completo (la lista no incluye artículos)
  useEffect(() => {
    if (!open || !order) return

    setSource(order.source)
    setCustomerName(order.customer_name ?? '')
    setCustomerPhone(order.customer_phone ?? '')
    setNotes(order.notes ?? '')
    setItemsLocked(false)
    setError(null)

    let cancelled = false
    const loadItems = async () => {
      setLoadingOrder(true)
      try {
        const full = await ordersService.getOrder(order.id)
        if (cancelled) return
        const orderItems = full.items ?? []
        if (orderItems.length > 0 && orderItems.every((it) => it.variant_id)) {
          setItems(
            orderItems.map((it) => ({ variantId: it.variant_id!, quantity: it.quantity })),
          )
        } else {
          // Artículos sin variante (importación histórica): solo se editan los detalles
          setItemsLocked(true)
          setItems([{ variantId: '', quantity: 1 }])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar el pedido')
        }
      } finally {
        if (!cancelled) setLoadingOrder(false)
      }
    }
    loadItems()
    return () => {
      cancelled = true
    }
  }, [open, order])

  const handleAddItem = () => {
    setItems((prev) => [...prev, { variantId: '', quantity: 1 }])
  }

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const validItems = items.filter((it) => it.variantId)
    if (!itemsLocked) {
      if (validItems.length === 0) {
        setError('Agrega al menos un artículo')
        return
      }
      if (validItems.some((it) => it.quantity <= 0)) {
        setError('La cantidad de cada artículo debe ser mayor a cero')
        return
      }
    }

    const req: UpdateOrderRequest = {
      source,
      customer_name: customerName || undefined,
      customer_phone: customerPhone || undefined,
      notes: notes || undefined,
    }
    if (!itemsLocked) {
      req.items = validItems.map((it) => ({
        variant_id: it.variantId,
        quantity: it.quantity,
      }))
    }

    try {
      setLoading(true)
      if (order) {
        await ordersService.updateOrder(order.id, req)
        toast.success('Pedido actualizado')
      } else {
        await ordersService.createOrder({ ...req, items: req.items ?? [] })
        toast.success('Pedido registrado exitosamente')
      }
      onSuccess()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el pedido')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSource('whatsapp')
    setCustomerName('')
    setCustomerPhone('')
    setNotes('')
    setItems([{ variantId: '', quantity: 1 }])
    setItemsLocked(false)
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar pedido' : 'Nuevo pedido'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Source */}
          <div>
            <Label className="mb-2">Canal *</Label>
            <Select value={source} onValueChange={(v) => setSource(v as OrderSource)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MANUAL_SOURCES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-2">Nombre del cliente</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nombre"
              />
            </div>
            <div>
              <Label className="mb-2">Teléfono</Label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+57..."
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <Label className="mb-2">Artículos *</Label>
            {loadingOrder ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Cargando artículos...
              </p>
            ) : itemsLocked ? (
              <p className="rounded-md bg-muted p-3 text-sm text-[var(--color-muted-foreground)]">
                Los artículos de pedidos históricos no se pueden editar. Solo se
                actualizarán los datos del pedido.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Select
                        value={item.variantId}
                        onValueChange={(v) => handleItemChange(index, 'variantId', v)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Seleccionar variante" />
                        </SelectTrigger>
                        <SelectContent>
                          {variants.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {[v.product_sku, v.color?.sku, v.size?.sku].filter(Boolean).join('-') || '—'} — {v.color?.name ?? '—'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min={1}
                        className="w-20"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)
                        }
                      />
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleAddItem}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Agregar artículo
                </Button>
              </>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label className="mb-2">Notas</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas internas opcionales"
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || loadingOrder}>
              {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar pedido'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
