import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import type { ProductCategory, ProductType } from '@/types/product'
import type { Package } from '@/types/package'
import { productService } from '@/services/productService'
import { packageService } from '@/services/packageService'
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
  const [loading, setLoading] = useState(false)
  const [loadingPackages, setLoadingPackages] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load packages on mount
   */
  useEffect(() => {
    if (isOpen) {
      loadPackages()
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-background p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Crear Producto</h2>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            ×
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {/* Actions */}
          <div className="flex justify-end gap-3">
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
