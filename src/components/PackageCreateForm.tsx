import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { packageService } from '@/services/packageService'
import { toast } from '@/utils/toast'

/**
 * Props for PackageCreateForm component
 */
interface PackageCreateFormProps {
  onSuccess: () => void
  onCancel: () => void
}

/**
 * PackageCreateForm
 * Inline form for creating packages
 */
export const PackageCreateForm = ({
  onSuccess,
  onCancel,
}: PackageCreateFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    initial_cost: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.name.trim()) {
      setError('El nombre es requerido')
      return
    }
    const cost = parseFloat(formData.initial_cost)
    if (isNaN(cost) || cost < 0) {
      setError('El costo debe ser mayor o igual a cero')
      return
    }

    try {
      setLoading(true)
      await packageService.createPackage({
        name: formData.name,
        description: formData.description || undefined,
        initial_cost: cost,
      })
      toast.success('Empaque creado exitosamente')
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el empaque')
    } finally {
      setLoading(false)
    }
  }

  return (
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

      {/* Initial Cost */}
      <div>
        <Label htmlFor="initial_cost">Costo Inicial *</Label>
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
          {loading ? 'Creando...' : 'Crear Empaque'}
        </Button>
      </div>
    </form>
  )
}
