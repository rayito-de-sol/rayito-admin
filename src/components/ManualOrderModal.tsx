import { useState, useEffect, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
import { SearchableSelect } from '@/components/SearchableSelect'
import { CustomerFormModal } from '@/components/CustomerFormModal'
import { ordersService } from '@/services/ordersService'
import { variantService } from '@/services/variantService'
import type { Variant } from '@/types/variant'
import type { Order, OrderSource } from '@/types/order'
import { ORDER_SOURCE_LABELS } from '@/types/order'
import type { Customer } from '@/types/customer'
import { CUSTOMER_TYPE_LABELS } from '@/types/customer'
import { addDaysISO } from '@/utils/date'
import { toast } from '@/utils/toast'
import { Trash2, Plus } from 'lucide-react'

// Canales de entrada manual para personas; las tiendas siempre usan 'store'
const MANUAL_SOURCES: { value: OrderSource; label: string }[] = [
  { value: 'whatsapp', label: ORDER_SOURCE_LABELS.whatsapp },
  { value: 'shopify', label: ORDER_SOURCE_LABELS.shopify },
]

/** Plazo por defecto de las ventas a crédito */
const DEFAULT_DUE_DAYS = 30

interface LineItem {
  variantId: string
  quantity: number
}

interface ManualOrderModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  /** null/undefined = crear, con valor = editar */
  order?: Order | null
  customers: Customer[]
  onCustomerCreated: (customer: Customer) => void
}

/**
 * ManualOrderModal
 * Registra o edita una venta. El cliente decide el resto: una tienda fuerza el
 * canal 'store', se factura con cuenta de cobro y queda por cobrar; una persona
 * elige canal y se paga de contado.
 *
 * Al editar, los artículos de importaciones históricas (sin variante) quedan
 * bloqueados: solo se actualizan los datos del pedido.
 */
export const ManualOrderModal = ({
  open,
  onClose,
  onSuccess,
  order,
  customers,
  onCustomerCreated,
}: ManualOrderModalProps) => {
  const isEdit = !!order

  const [customerId, setCustomerId] = useState('')
  const [source, setSource] = useState<OrderSource>('whatsapp')
  const [paid, setPaid] = useState(true)
  const [paymentDueDate, setPaymentDueDate] = useState(addDaysISO(DEFAULT_DUE_DAYS))
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<LineItem[]>([{ variantId: '', quantity: 1 }])
  const [itemsLocked, setItemsLocked] = useState(false)
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)

  const selectedCustomer = customers.find((customer) => customer.id === customerId)
  const isStore = selectedCustomer?.type === 'store'

  useEffect(() => {
    if (!open) return
    variantService.listVariants().then(setVariants).catch(() => {})
  }, [open])

  // Al abrir en modo creación, volver a los valores por defecto
  useEffect(() => {
    if (!open || order) return
    setCustomerId('')
    setSource('whatsapp')
    setPaid(true)
    setPaymentDueDate(addDaysISO(DEFAULT_DUE_DAYS))
    setNotes('')
    setItems([{ variantId: '', quantity: 1 }])
    setItemsLocked(false)
    setError(null)
  }, [open, order])

  // En modo edición, cargar el pedido completo (la lista no incluye artículos)
  useEffect(() => {
    if (!open || !order) return

    setCustomerId(order.customer_id ?? '')
    setSource(order.source)
    setPaid(!!order.paid_at)
    setPaymentDueDate(order.payment_due_date ?? addDaysISO(DEFAULT_DUE_DAYS))
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
        if (orderItems.length > 0 && orderItems.every((item) => item.variant_id)) {
          setItems(
            orderItems.map((item) => ({
              variantId: item.variant_id!,
              quantity: item.quantity,
            })),
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

  /** Elegir cliente fija el canal y la forma de pago que le corresponden */
  const handleCustomerChange = (customer: Customer) => {
    setCustomerId(customer.id)
    if (customer.type === 'store') {
      setSource('store')
      setPaid(false)
    } else {
      if (source === 'store') setSource('whatsapp')
      setPaid(true)
    }
  }

  const handleAddItem = () => {
    setItems((previous) => [...previous, { variantId: '', quantity: 1 }])
  }

  const handleRemoveItem = (index: number) => {
    setItems((previous) => {
      const next = previous.filter((_, i) => i !== index)
      // Siempre dejar al menos una fila vacía para seguir agregando
      return next.length > 0 ? next : [{ variantId: '', quantity: 1 }]
    })
  }

  const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    setItems((previous) =>
      previous.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!customerId) {
      setError('Selecciona un cliente')
      return
    }

    const validItems = items.filter((item) => item.variantId)
    if (!itemsLocked) {
      if (validItems.length === 0) {
        setError('Agrega al menos un artículo')
        return
      }
      if (validItems.some((item) => item.quantity <= 0)) {
        setError('La cantidad de cada artículo debe ser mayor a cero')
        return
      }
    }

    if (!paid && !paymentDueDate) {
      setError('Ingresa la fecha de vencimiento')
      return
    }

    const mappedItems = validItems.map((item) => ({
      variant_id: item.variantId,
      quantity: item.quantity,
    }))

    try {
      setLoading(true)
      if (order) {
        await ordersService.updateOrder(order.id, {
          customer_id: customerId,
          source: isStore ? 'store' : source,
          payment_due_date: paid ? undefined : paymentDueDate,
          notes: notes || undefined,
          items: itemsLocked ? undefined : mappedItems,
        })
        toast.success('Pedido actualizado')
      } else {
        const result = await ordersService.createOrder({
          customer_id: customerId,
          source: isStore ? 'store' : source,
          paid,
          payment_due_date: paid ? undefined : paymentDueDate,
          notes: notes || undefined,
          items: mappedItems,
        })
        // El pedido se creó aunque el PDF de la cuenta de cobro haya fallado
        if (result.warning) {
          toast.warning(result.warning)
        } else {
          toast.success('Pedido registrado exitosamente')
        }
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el pedido')
    } finally {
      setLoading(false)
    }
  }

  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: customer.name,
    description: customer.identity_number || customer.contact_phone_number,
    badge: CUSTOMER_TYPE_LABELS[customer.type],
  }))

  const variantOptions = variants.map((variant) => ({
    value: variant.id,
    label:
      [variant.product_sku, variant.color?.sku, variant.size?.sku]
        .filter(Boolean)
        .join('-') || '—',
    description: [variant.product_name, variant.color?.name, variant.size?.label]
      .filter(Boolean)
      .join(' · '),
  }))

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Editar pedido' : 'Nuevo pedido'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cliente */}
            <div>
              <Label className="mb-2">Cliente *</Label>
              <SearchableSelect
                options={customerOptions}
                value={customerId}
                onChange={(id) => {
                  const customer = customers.find((c) => c.id === id)
                  if (customer) handleCustomerChange(customer)
                }}
                placeholder="Seleccionar cliente"
                searchPlaceholder="Buscar por nombre, identificación o teléfono"
                emptyText="No hay clientes"
                onCreateNew={() => setShowCustomerModal(true)}
                createNewLabel="Nuevo cliente"
              />
              {isStore && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Se generará una cuenta de cobro para esta venta.
                </p>
              )}
            </div>

            {/* Canal: las ventas a tiendas siempre son del canal tienda */}
            {!isStore && (
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
            )}

            {/* Artículos */}
            <div>
              <Label className="mb-2">Artículos *</Label>
              {loadingOrder ? (
                <p className="text-sm text-muted-foreground">Cargando artículos...</p>
              ) : itemsLocked ? (
                <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  Los artículos de pedidos históricos no se pueden editar. Solo se
                  actualizarán los datos del pedido.
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <SearchableSelect
                          options={variantOptions}
                          value={item.variantId}
                          onChange={(value) => handleItemChange(index, 'variantId', value)}
                          placeholder="Seleccionar variante"
                          searchPlaceholder="Buscar por SKU, producto o color"
                          emptyText="No hay variantes"
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          min={1}
                          className="w-20"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                          aria-label="Quitar artículo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

            {/* Pago */}
            <div className="space-y-3 rounded-md border border-border p-3">
              {!isEdit && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="order-paid"
                    checked={paid}
                    onCheckedChange={(checked) => setPaid(checked === true)}
                  />
                  <Label htmlFor="order-paid" className="cursor-pointer">
                    Pagado
                  </Label>
                </div>
              )}
              {!paid && (
                <div>
                  <Label htmlFor="order-due-date" className="mb-2">
                    Fecha de vencimiento *
                  </Label>
                  <Input
                    id="order-due-date"
                    type="date"
                    value={paymentDueDate}
                    onChange={(e) => setPaymentDueDate(e.target.value)}
                  />
                </div>
              )}
              {isEdit && paid && (
                <p className="text-sm text-muted-foreground">
                  Este pedido ya está pagado.
                </p>
              )}
            </div>

            {/* Notas */}
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
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || loadingOrder}>
                {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar pedido'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alta de cliente sin salir de la venta */}
      <CustomerFormModal
        open={showCustomerModal}
        customer={null}
        defaultType="person"
        onClose={() => setShowCustomerModal(false)}
        onSuccess={(customer) => {
          onCustomerCreated(customer)
          handleCustomerChange(customer)
        }}
      />
    </>
  )
}
