import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import type { Product, ProductCategory, ProductStatus } from '@/types/product'
import type { Package } from '@/types/package'
import { productService } from '@/services/productService'
import { packageService } from '@/services/packageService'
import { toast } from '@/utils/toast'

/**
 * Props for ProductEditModal component
 */
interface ProductEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  product: Product
}

/**
 * ProductEditModal
 * Modal form for editing existing products
 */
export const ProductEditModal = ({
  isOpen,
  onClose,
  onSuccess,
  product,
}: ProductEditModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'mono' as ProductCategory,
    status: 'draft' as ProductStatus,
    tags: '',
    package_id: '',
  })

  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPackages, setLoadingPackages] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Initialize form data when product or modal opens
   */
  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        category: product.category,
        status: product.status,
        tags: product.tags?.join(', ') || '',
        package_id: product.package_id || '',
      })
      loadPackages()
    }
  }, [isOpen, product])

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

    try {
      setLoading(true)

      // Parse tags
      const tags = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      // Update product
      await productService.updateProduct(product.id, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        category: formData.category,
        status: formData.status,
        tags: tags.length > 0 ? tags : undefined,
        package_id: formData.package_id || null,
      })

      // Success
      toast.success('Producto actualizado exitosamente')
      onSuccess()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al actualizar el producto'
      )
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle close
   */
  const handleClose = () => {
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-background p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Editar Producto</h2>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            ×
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Nombre *</Label>
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
            <Label htmlFor="slug">Slug *</Label>
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
            <Label htmlFor="description">Descripción</Label>
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

          {/* Category */}
          <div>
            <Label htmlFor="category">Categoría *</Label>
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

          {/* Status */}
          <div>
            <Label htmlFor="status">Estado *</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
              disabled={loading}
            >
              <option value="draft">Borrador</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          {/* Type (disabled) */}
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Input
              id="type"
              name="type"
              value={product.type === 'set' ? 'Set' : 'Simple'}
              disabled
              className="bg-muted"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              El tipo no se puede cambiar después de la creación
            </p>
          </div>

          {/* Package */}
          <div>
            <Label htmlFor="package_id">Empaque</Label>
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
            <Label htmlFor="tags">Etiquetas</Label>
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
              {loading ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
