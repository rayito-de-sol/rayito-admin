import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { sizeService } from '@/services/sizeService'
import type { Size } from '@/types/size'
import { useAuth } from '@/hooks/useAuth'
import { Pencil, Trash2, X, Check } from 'lucide-react'

export const SizesPage = () => {
  const { user } = useAuth()
  const canEdit = user?.role === 'admin' || user?.role === 'manager'

  const [sizes, setSizes] = useState<Size[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newLabel, setNewLabel] = useState('')
  const [newSKU, setNewSKU] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editSKU, setEditSKU] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await sizeService.listSizes()
      setSizes(data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las tallas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const label = newLabel.trim()
    if (!label) { setCreateError('La etiqueta es requerida'); return }

    setCreating(true)
    setCreateError(null)
    try {
      const sku = newSKU.trim().toUpperCase() || undefined
      await sizeService.createSize({ label, sku })
      setNewLabel('')
      setNewSKU('')
      await load()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear la talla')
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (size: Size) => {
    setEditingId(size.id)
    setEditLabel(size.label)
    setEditSKU(size.sku ?? '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditLabel('')
    setEditSKU('')
  }

  const handleUpdate = async (id: string) => {
    const label = editLabel.trim()
    if (!label) return

    setEditLoading(true)
    try {
      await sizeService.updateSize(id, { label, sku: editSKU.trim().toUpperCase() || undefined })
      cancelEdit()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la talla')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await sizeService.deleteSize(id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la talla')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tallas</h1>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {canEdit && (
        <form onSubmit={handleCreate} className="flex items-end gap-3 rounded-lg border p-4">
          <div className="flex-1">
            <Label htmlFor="new-size-label" className="mb-2">Etiqueta</Label>
            <Input
              id="new-size-label"
              placeholder='Ej: "Niña", "Adulto", "4cm"'
              value={newLabel}
              onChange={(e) => { setNewLabel(e.target.value); setCreateError(null) }}
              disabled={creating}
            />
          </div>
          <div className="w-36">
            <Label htmlFor="new-size-sku" className="mb-2">SKU</Label>
            <Input
              id="new-size-sku"
              placeholder="Ej: NINA"
              value={newSKU}
              onChange={(e) => { setNewSKU(e.target.value.toUpperCase()); setCreateError(null) }}
              disabled={creating}
            />
          </div>
          <Button type="submit" disabled={creating}>
            {creating ? 'Agregando...' : 'Agregar Talla'}
          </Button>
        </form>
      )}

      {createError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{createError}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : sizes.length === 0 ? (
        <p className="text-muted-foreground">No hay tallas registradas.</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Etiqueta</th>
                <th className="px-4 py-3 text-left font-medium">SKU</th>
                {canEdit && <th className="px-4 py-3 text-right font-medium">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {sizes.map((size) => (
                <tr key={size.id} className="border-b last:border-0 hover:bg-muted/20">
                  {editingId === size.id ? (
                    <>
                      <td className="px-4 py-2">
                        <Input
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          disabled={editLoading}
                          className="h-8"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          value={editSKU}
                          onChange={(e) => setEditSKU(e.target.value.toUpperCase())}
                          disabled={editLoading}
                          className="h-8 w-28"
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => handleUpdate(size.id)} disabled={editLoading}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit} disabled={editLoading}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">{size.label}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{size.sku ?? '—'}</td>
                      {canEdit && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => startEdit(size)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(size.id)}
                              disabled={deletingId === size.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
