import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { variantService } from '@/services/variantService'
import { productService } from '@/services/productService'
import { colorService } from '@/services/colorService'
import { sizeService } from '@/services/sizeService'
import type { Product } from '@/types/product'
import type { Color } from '@/types/color'
import type { Size } from '@/types/size'
import { X } from 'lucide-react'

interface VariantCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormState {
  color_id: string
  size_id: string
  stock: string
  initial_cost: string
  product_id: string
}

const emptyForm = (): FormState => ({
  color_id: '',
  size_id: '',
  stock: '0',
  initial_cost: '0',
  product_id: '',
})

export const VariantCreateModal = ({
  isOpen,
  onClose,
  onSuccess,
}: VariantCreateModalProps) => {
  const [form, setForm] = useState<FormState>(emptyForm())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [colors, setColors] = useState<Color[]>([])
  const [sizes, setSizes] = useState<Size[]>([])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    productService.listProducts({}).then((data) => setProducts(data ?? [])).catch(() => {})
    colorService.listColors().then((data) => setColors(data ?? [])).catch(() => {})
    sizeService.listSizes().then((data) => setSizes(data ?? [])).catch(() => {})
  }, [isOpen])

  const resetForm = () => {
    setForm(emptyForm())
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const color_id = form.color_id
    const stock = Number(form.stock)
    const initial_cost = Number(form.initial_cost)

    if (!color_id) { setError('El color es requerido'); return }
    if (isNaN(stock) || stock < 0) { setError('El stock debe ser mayor o igual a cero'); return }
    if (isNaN(initial_cost) || initial_cost < 0) { setError('El costo debe ser mayor o igual a cero'); return }

    setLoading(true)
    setError(null)
    try {
      const payload: Parameters<typeof variantService.bulkCreate>[0]['variants'][0] = {
        color_id, stock, initial_cost,
      }
      if (form.size_id) payload.size_id = form.size_id
      if (form.product_id) payload.product_id = form.product_id
      await variantService.bulkCreate({ variants: [payload] })
      resetForm()
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la variante')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold">Nueva Variante</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-4">
            <div>
              <Label htmlFor="vc-product" className="mb-2">Producto (opcional)</Label>
              <select
                id="vc-product"
                value={form.product_id}
                onChange={(e) => handleChange('product_id', e.target.value)}
                disabled={loading}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Sin asignar</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="vc-color" className="mb-2">Color *</Label>
              <select
                id="vc-color"
                value={form.color_id}
                onChange={(e) => handleChange('color_id', e.target.value)}
                disabled={loading}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Seleccionar color...</option>
                {colors.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.sku})</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="vc-size" className="mb-2">Talla (opcional)</Label>
              <select
                id="vc-size"
                value={form.size_id}
                onChange={(e) => handleChange('size_id', e.target.value)}
                disabled={loading}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Sin talla</option>
                {sizes.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}{s.sku ? ` (${s.sku})` : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="vc-stock" className="mb-2">Stock *</Label>
              <Input
                id="vc-stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="vc-cost" className="mb-2">Costo Inicial *</Label>
              <Input
                id="vc-cost"
                type="number"
                min="0"
                step="0.01"
                value={form.initial_cost}
                onChange={(e) => handleChange('initial_cost', e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? 'Creando...' : 'Crear Variante'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
