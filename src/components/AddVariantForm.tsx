import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import type { Size } from '@/types/size'
import type { VariantImage } from '@/types/variant'
import type { Color } from '@/types/color'
import { colorService } from '@/services/colorService'

interface AddVariantFormProps {
  productId: string
  sizes: Size[]
  onAdd: (data: {
    color_id: string
    size_id?: string
    stock: number
    images: VariantImage[]
  }) => Promise<void>
  onCancel: () => void
}

export const AddVariantForm = ({
  sizes,
  onAdd,
  onCancel,
}: AddVariantFormProps) => {
  const [colors, setColors] = useState<Color[]>([])
  const [formData, setFormData] = useState({
    color_id: '',
    size_id: '',
    stock: '',
  })

  const [images, setImages] = useState<VariantImage[]>([
    { url: '', alt: '', is_primary: true },
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    colorService.listColors().then(setColors).catch(() => {})
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (index: number, field: 'url' | 'alt', value: string) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, [field]: value } : img))
    )
  }

  const handlePrimaryChange = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, is_primary: i === index }))
    )
  }

  const addImage = () => {
    setImages((prev) => [...prev, { url: '', alt: '', is_primary: false }])
  }

  const removeImage = (index: number) => {
    if (images.length === 1) return
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      if (prev[index]?.is_primary && updated.length > 0) {
        updated[0]!.is_primary = true
      }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.color_id) {
      setError('El color es requerido')
      return
    }

    const stock = parseInt(formData.stock, 10)
    if (isNaN(stock) || stock < 0) {
      setError('El stock debe ser mayor o igual a cero')
      return
    }

    const validImages = images.filter((img) => img.url.trim().length > 0)

    try {
      setLoading(true)
      await onAdd({
        color_id: formData.color_id,
        size_id: formData.size_id || undefined,
        stock,
        images: validImages,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la variante')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Color */}
      <div>
        <Label htmlFor="color_id" className="mb-2">
          Color *
        </Label>
        <select
          id="color_id"
          name="color_id"
          value={formData.color_id}
          onChange={handleChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          required
          disabled={loading}
        >
          <option value="">Seleccionar color</option>
          {colors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.sku})
            </option>
          ))}
        </select>
      </div>

      {/* Size */}
      <div>
        <Label htmlFor="size_id" className="mb-2">
          Talla
        </Label>
        <select
          id="size_id"
          name="size_id"
          value={formData.size_id}
          onChange={handleChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          disabled={loading}
        >
          <option value="">Sin talla</option>
          {sizes.map((size) => (
            <option key={size.id} value={size.id}>
              {size.label}
            </option>
          ))}
        </select>
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
                  <label htmlFor={`primary-${index}`} className="text-sm font-medium">
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
                  onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                  disabled={loading}
                />
                <Input
                  placeholder="Texto alternativo (opcional)"
                  value={image.alt}
                  onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
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

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Crear Variante'}
        </Button>
      </div>
    </form>
  )
}
