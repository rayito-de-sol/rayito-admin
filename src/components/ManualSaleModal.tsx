import { useState, useEffect } from 'react'
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
import { salesService } from '@/services/salesService'
import { variantService } from '@/services/variantService'
import type { Variant } from '@/types/variant'
import type { CreateSaleRequest, SaleSource } from '@/types/sale'
import { toast } from '@/utils/toast'
import { Trash2, Plus } from 'lucide-react'

// Currently only manual sources are exposed here; extend as needed
const MANUAL_SOURCES: { value: SaleSource; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
]

interface LineItem {
  variantId: string
  quantity: number
}

interface ManualSaleModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

/**
 * ManualSaleModal
 * Form to record a manual sale (WhatsApp, etc.)
 * Source dropdown is extensible for future channels.
 */
export const ManualSaleModal = ({ open, onClose, onSuccess }: ManualSaleModalProps) => {
  const [source, setSource] = useState<SaleSource>('whatsapp')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<LineItem[]>([{ variantId: '', quantity: 1 }])
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    variantService.listVariants().then(setVariants).catch(() => {})
  }, [open])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validItems = items.filter((it) => it.variantId)
    if (validItems.length === 0) {
      setError('Agrega al menos un artículo')
      return
    }
    if (validItems.some((it) => it.quantity <= 0)) {
      setError('La cantidad de cada artículo debe ser mayor a cero')
      return
    }

    const req: CreateSaleRequest = {
      source,
      customer_name: customerName || undefined,
      customer_phone: customerPhone || undefined,
      notes: notes || undefined,
      items: validItems.map((it) => ({
        variant_id: it.variantId,
        quantity: it.quantity,
      })),
    }

    try {
      setLoading(true)
      await salesService.createSale(req)
      toast.success('Venta registrada exitosamente')
      onSuccess()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar la venta')
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
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva venta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Source */}
          <div>
            <Label className="mb-2">Canal *</Label>
            <Select value={source} onValueChange={(v) => setSource(v as SaleSource)}>
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
                          {v.sku} — {v.color}
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Registrar venta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
