import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

/**
 * Props for AddSizeForm component
 */
interface AddSizeFormProps {
  onAdd: (label: string) => Promise<void>
  onCancel: () => void
}

/**
 * AddSizeForm
 * Inline form for creating product sizes
 */
export const AddSizeForm = ({ onAdd, onCancel }: AddSizeFormProps) => {
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!label.trim()) {
      setError('La etiqueta es requerida')
      return
    }

    try {
      setLoading(true)
      await onAdd(label.trim())
      setLabel('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la talla')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="size-label" className="mb-2">
          Etiqueta de Talla *
        </Label>
        <Input
          id="size-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder='Ej: "Niña", "Adulto", "4cm"'
          required
          disabled={loading}
        />
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

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
          {loading ? 'Creando...' : 'Crear Talla'}
        </Button>
      </div>
    </form>
  )
}
