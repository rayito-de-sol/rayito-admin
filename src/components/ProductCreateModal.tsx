import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import type { ProductCategory, ProductType, SetItemRequest } from '@/types/product'
import type { Package } from '@/types/package'
import type { Variant } from '@/types/variant'
import { productService } from '@/services/productService'
import { packageService } from '@/services/packageService'
import { variantService } from '@/services/variantService'
import { toast } from '@/utils/toast'

/**
 * Props for ProductCreateModal component
 */
interface ProductCreateModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback to close the modal */
  onClose: () => void
  /** Callback on successful product creation */
  onSuccess: () => void
}

/**
 * ProductCreateModal
 * Modal form for creating new products
 */
export const ProductCreateModal = ({
  isOpen,
  onClose,
  onSuccess,
}: ProductCreateModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sku_prefix: '',
    category: 'mono' as ProductCategory,
    type: 'single' as ProductType,
    tags: '',
    package_id: '',
    initial_price: '',
  })

  const [packages, setPackages] = useState<Package[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [setItems, setSetItems] = useState<SetItemRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPackages, setLoadingPackages] = useState(false)
  const [loadingVariants, setLoadingVariants] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load packages and variants on mount
   */
  useEffect(() => {
    if (isOpen) {
      loadPackages()
      loadVariants()
    }
  }, [isOpen])

  /**
   * Handle ESC key to close modal
   */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  const loadPackages = async () => {
    try {
      setLoadingPackages(true)
      const data = await packageService.listPackages()
      setPackages(data)
    } catch (err) {
      console.error('Error loading packages:', err)
    } finally {
      setLoadingPackages(false)
    }
  }

  const loadVariants = async () => {
    try {
      setLoadingVariants(true)
      const data = await variantService.listVariants()
      setVariants(data)
    } catch (err) {
      console.error('Error loading variants:', err)
    } finally {
      setLoadingVariants(false)
    }
  }

  /**
   * Handle input change
   */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear set items when switching away from "set" type
    if (name === 'type' && value !== 'set') {
      setSetItems([])
    }
  }

  /**
   * Add a new set item
   */
  const handleAddSetItem = () => {
    if (variants.length > 0) {
      setSetItems((prev) => [
        ...prev,
        { variant_id: variants[0].id, quantity: 1 },
      ])
    }
  }

  /**
   * Update a set item
   */
  const handleUpdateSetItem = (
    index: number,
    field: 'variant_id' | 'quantity',
    value: string | number
  ) => {
    setSetItems((prev) => {
      const updated = [...prev]
      if (field === 'variant_id') {
        updated[index].variant_id = value as string
      } else {
        updated[index].quantity = Number(value)
      }
      return updated
    })
  }

  /**
   * Remove a set item
   */
  const handleRemoveSetItem = (index: number) => {
    setSetItems((prev) => prev.filter((_, i) => i !== index))
  }

  /**
   * Validate slug format (letters, numbers, hyphens only)
   */
  const isValidSlug = (slug: string): boolean => {
    return /^[a-z0-9-]+$/.test(slug)
  }

  /**
   * Handle form submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.name.trim()) {
      setError('El nombre es requerido')
      return
    }
    if (!formData.slug.trim()) {
      setError('El slug es requerido')
      return
    }
    if (!isValidSlug(formData.slug)) {
      setError('El slug debe contener solo letras, números y guiones')
      return
    }
    if (!formData.sku_prefix.trim()) {
      setError('El prefijo SKU es requerido')
      return
    }
    const price = parseFloat(formData.initial_price)
    if (isNaN(price) || price < 0) {
      setError('El precio debe ser mayor o igual a cero')
      return
    }

    // Validate set items for set products
    if (formData.type === 'set') {
      if (setItems.length === 0) {
        setError('Los productos tipo Set deben tener al menos un item')
        return
      }
      // Validate quantities
      for (const item of setItems) {
        if (item.quantity < 1) {
          setError('Las cantidades deben ser mayores a cero')
          return
        }
      }
    }

    try {
      setLoading(true)

      // Parse tags
      const tags = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      // Create product
      await productService.createProduct({
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        sku_prefix: formData.sku_prefix,
        category: formData.category,
        type: formData.type,
        tags: tags.length > 0 ? tags : undefined,
        package_id: formData.package_id || null,
        initial_price: price,
        set_items: formData.type === 'set' ? setItems : undefined,
      })

      // Success
      toast.success('Producto creado exitosamente')
      onSuccess()
      resetForm()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al crear el producto'
      )
    } finally {
      setLoading(false)
    }
  }

  /**
   * Reset form
   */
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      sku_prefix: '',
      category: 'mono' as ProductCategory,
      type: 'single' as ProductType,
      tags: '',
      package_id: '',
      initial_price: '',
    })
    setSetItems([])
    setError(null)
  }

  /**
   * Handle close
   */
  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-background shadow-lg">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-2xl font-bold">Crear Producto</h2>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            ×
          </Button>
        </div>

        {/* Form Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {/* Name */}
          <div>
            <Label htmlFor="name" className="mb-2">
              Nombre *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug" className="mb-2">
              Slug *
            </Label>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="ejemplo-producto"
              required
              disabled={loading}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Solo letras minúsculas, números y guiones
            </p>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="mb-2">
              Descripción
            </Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              disabled={loading}
            />
          </div>

          {/* SKU Prefix */}
          <div>
            <Label htmlFor="sku_prefix" className="mb-2">
              Prefijo SKU *
            </Label>
            <Input
              id="sku_prefix"
              name="sku_prefix"
              value={formData.sku_prefix}
              onChange={handleChange}
              placeholder="MONO"
              required
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category" className="mb-2">
              Categoría *
            </Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
              disabled={loading}
            >
              <option value="set">Set</option>
              <option value="turbante">Turbante</option>
              <option value="cintillo">Cintillo</option>
              <option value="pinza">Pinza</option>
              <option value="maximono">Maximono</option>
              <option value="mono">Mono</option>
              <option value="diadema">Diadema</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <Label htmlFor="type" className="mb-2">
              Tipo *
            </Label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
              disabled={loading}
            >
              <option value="single">Simple</option>
              <option value="set">Set</option>
            </select>
          </div>

          {/* Set Items (only for type "set") */}
          {formData.type === 'set' && (
            <div className="space-y-3 rounded-md border border-input p-4">
              <div className="flex items-center justify-between">
                <Label className="mb-0">
                  Items del Set * {setItems.length > 0 && `(${setItems.length})`}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSetItem}
                  disabled={loading || loadingVariants || variants.length === 0}
                >
                  + Agregar Item
                </Button>
              </div>

              {loadingVariants && (
                <p className="text-sm text-muted-foreground">
                  Cargando variantes...
                </p>
              )}

              {!loadingVariants && variants.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No hay variantes disponibles. Crea productos con variantes primero.
                </p>
              )}

              {setItems.length === 0 && !loadingVariants && variants.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Haz clic en "Agregar Item" para añadir variantes al set
                </p>
              )}

              {setItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 rounded-md border border-border p-3"
                >
                  <div className="flex-1">
                    <Label htmlFor={`variant-${index}`} className="mb-2 text-xs">
                      Variante
                    </Label>
                    <select
                      id={`variant-${index}`}
                      value={item.variant_id}
                      onChange={(e) =>
                        handleUpdateSetItem(index, 'variant_id', e.target.value)
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      disabled={loading}
                    >
                      {variants.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.product_name} - {variant.color} (SKU: {variant.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <Label htmlFor={`quantity-${index}`} className="mb-2 text-xs">
                      Cantidad
                    </Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateSetItem(index, 'quantity', e.target.value)
                      }
                      disabled={loading}
                      className="text-sm"
                    />
                  </div>

                  <div className="pt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSetItem(index)}
                      disabled={loading}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Package */}
          <div>
            <Label htmlFor="package_id" className="mb-2">
              Empaque
            </Label>
            <select
              id="package_id"
              name="package_id"
              value={formData.package_id}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              disabled={loading || loadingPackages}
            >
              <option value="">Sin empaque</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags" className="mb-2">
              Etiquetas
            </Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="tag1, tag2, tag3"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Separadas por comas
            </p>
          </div>

          {/* Initial Price */}
          <div>
            <Label htmlFor="initial_price" className="mb-2">
              Precio Inicial *
            </Label>
            <Input
              id="initial_price"
              name="initial_price"
              type="number"
              min="0"
              step="0.01"
              value={formData.initial_price}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          </div>

          {/* Actions - Fixed at bottom */}
          <div className="flex justify-end gap-3 border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
