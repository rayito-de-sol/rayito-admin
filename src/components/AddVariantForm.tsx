import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import type { Size } from '@/types/size'
import type { VariantImage } from '@/types/variant'

/**
 * Props for AddVariantForm component
 */
interface AddVariantFormProps {
  productId: string
  sizes: Size[]
  onAdd: (data: {
    color: string
    size_id: string
    sku: string
    stock: number
    initial_cost: number
    images: VariantImage[]
  }) => Promise<void>
  onCancel: () => void
}

/**
 * AddVariantForm
 * Form for creating product variants with image management
 */
export const AddVariantForm = ({
  sizes,
  onAdd,
  onCancel,
}: AddVariantFormProps) => {
  const [formData, setFormData] = useState({
    color: '',
    size_id: '',
    sku: '',
    stock: '',
    initial_cost: '',
  })

  const [images, setImages] = useState<VariantImage[]>([
    { url: '', alt: '', is_primary: true },
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Handle input change
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  /**
   * Handle image field change
   */
  const handleImageChange = (
    index: number,
    field: 'url' | 'alt',
    value: string
  ) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, [field]: value } : img))
    )
  }

  /**
   * Handle primary image selection
   */
  const handlePrimaryChange = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, is_primary: i === index }))
    )
  }

  /**
   * Add new image
   */
  const addImage = () => {
    setImages((prev) => [...prev, { url: '', alt: '', is_primary: false }])
  }

  /**
   * Remove image
   */
  const removeImage = (index: number) => {
    if (images.length === 1) return // Keep at least one

    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      // If removed image was primary, make first image primary
      if (prev[index]?.is_primary && updated.length > 0) {
        updated[0]!.is_primary = true
      }
      return updated
    })
  }

  /**
   * Handle form submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.color.trim()) {
      setError('El color es requerido')
      return
    }
    if (!formData.size_id) {
      setError('La talla es requerida')
      return
    }
    if (!formData.sku.trim()) {
      setError('El SKU es requerido')
      return
    }

    const stock = parseInt(formData.stock, 10)
    if (isNaN(stock) || stock < 0) {
      setError('El stock debe ser mayor o igual a cero')
      return
    }

    const cost = parseFloat(formData.initial_cost)
    if (isNaN(cost) || cost < 0) {
      setError('El costo debe ser mayor o igual a cero')
      return
    }

    // Filter out empty images
    const validImages = images.filter((img) => img.url.trim().length > 0)

    try {
      setLoading(true)
      await onAdd({
        color: formData.color,
        size_id: formData.size_id,
        sku: formData.sku,
        stock,
        initial_cost: cost,
        images: validImages,
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al crear la variante'
      )
    } finally {
      setLoading(false)
    }
  }

  // Check if sizes exist
  if (sizes.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-muted/50 p-4 text-center">
          <p className="text-muted-foreground">
            Primero debe crear una talla para este producto
          </p>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cerrar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Color */}
      <div>
        <Label htmlFor="color" className="mb-2">
          Color *
        </Label>
        <Input
          id="color"
          name="color"
          value={formData.color}
          onChange={handleChange}
          placeholder="Ej: Rojo, Azul"
          required
          disabled={loading}
        />
      </div>

      {/* Size */}
      <div>
        <Label htmlFor="size_id" className="mb-2">
          Talla *
        </Label>
        <select
          id="size_id"
          name="size_id"
          value={formData.size_id}
          onChange={handleChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          required
          disabled={loading}
        >
          <option value="">Seleccionar talla</option>
          {sizes.map((size) => (
            <option key={size.id} value={size.id}>
              {size.label}
            </option>
          ))}
        </select>
      </div>

      {/* SKU */}
      <div>
        <Label htmlFor="sku" className="mb-2">
          SKU *
        </Label>
        <Input
          id="sku"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          placeholder="Ej: MONO-ROJO-NINA"
          required
          disabled={loading}
        />
      </div>

      {/* Stock */}
      <div>
        <Label htmlFor="stock" className="mb-2">
          Stock Inicial *
        </Label>
        <Input
          id="stock"
          name="stock"
          type="number"
          min="0"
          value={formData.stock}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      {/* Initial Cost */}
      <div>
        <Label htmlFor="initial_cost" className="mb-2">
          Costo Inicial *
        </Label>
        <Input
          id="initial_cost"
          name="initial_cost"
          type="number"
          min="0"
          step="0.01"
          value={formData.initial_cost}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      {/* Images */}
      <div>
        <Label className="mb-2">Imágenes</Label>
        <div className="space-y-3">
          {images.map((image, index) => (
            <div key={index} className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id={`primary-${index}`}
                    name="primary_image"
                    checked={image.is_primary}
                    onChange={() => handlePrimaryChange(index)}
                    disabled={loading}
                  />
                  <label
                    htmlFor={`primary-${index}`}
                    className="text-sm font-medium"
                  >
                    Principal
                  </label>
                </div>
                {images.length > 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeImage(index)}
                    disabled={loading}
                  >
                    Eliminar
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="URL de la imagen"
                  value={image.url}
                  onChange={(e) =>
                    handleImageChange(index, 'url', e.target.value)
                  }
                  disabled={loading}
                />
                <Input
                  placeholder="Texto alternativo (opcional)"
                  value={image.alt}
                  onChange={(e) =>
                    handleImageChange(index, 'alt', e.target.value)
                  }
                  disabled={loading}
                />
              </div>
            </div>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-2"
          onClick={addImage}
          disabled={loading}
        >
          + Agregar Imagen
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Crear Variante'}
        </Button>
      </div>
    </form>
  )
}
