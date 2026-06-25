import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { colorService } from '@/services/colorService'
import { RawSortableTh } from '@/components/RawSortableTh'
import { useSort } from '@/hooks/useSort'
import type { Color } from '@/types/color'
import { useAuth } from '@/hooks/useAuth'
import { Pencil, Trash2, X, Check } from 'lucide-react'

export const ColorsPage = () => {
  const { user } = useAuth()
  const canEdit = user?.role === 'admin' || user?.role === 'manager'

  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { sorted: sortedColors, sortKey, sortDir, toggleSort } = useSort(colors, {
    name: (c) => c.name,
    sku: (c) => c.sku,
  })

  const [newName, setNewName] = useState('')
  const [newSKU, setNewSKU] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSKU, setEditSKU] = useState('')
  const [editLoading, setEditLoading] = useState(false)

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await colorService.listColors()
      setColors(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los colores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    const sku = newSKU.trim().toUpperCase()
    if (!name) { setCreateError('El nombre es requerido'); return }
    if (!sku) { setCreateError('El SKU es requerido'); return }

    setCreating(true)
    setCreateError(null)
    try {
      await colorService.createColor({ name, sku })
      setNewName('')
      setNewSKU('')
      await load()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear el color')
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (color: Color) => {
    setEditingId(color.id)
    setEditName(color.name)
    setEditSKU(color.sku)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditSKU('')
  }

  const handleUpdate = async (id: string) => {
    const name = editName.trim()
    const sku = editSKU.trim().toUpperCase()
    if (!name || !sku) return

    setEditLoading(true)
    try {
      await colorService.updateColor(id, { name, sku })
      cancelEdit()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el color')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await colorService.deleteColor(id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el color')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Colores</h1>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {canEdit && (
        <form onSubmit={handleCreate} className="flex items-end gap-3 rounded-lg border p-4">
          <div className="flex-1">
            <Label htmlFor="new-color-name" className="mb-2">Nombre</Label>
            <Input
              id="new-color-name"
              placeholder="Ej: Rojo Vino"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setCreateError(null) }}
              disabled={creating}
            />
          </div>
          <div className="w-36">
            <Label htmlFor="new-color-sku" className="mb-2">SKU</Label>
            <Input
              id="new-color-sku"
              placeholder="Ej: ROJO"
              value={newSKU}
              onChange={(e) => { setNewSKU(e.target.value.toUpperCase()); setCreateError(null) }}
              disabled={creating}
            />
          </div>
          <Button type="submit" disabled={creating}>
            {creating ? 'Agregando...' : 'Agregar Color'}
          </Button>
        </form>
      )}

      {createError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{createError}</div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Cargando colores...</p>
      ) : colors.length === 0 ? (
        <p className="text-muted-foreground">No hay colores registrados.</p>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <RawSortableTh label="Nombre" sortKey="name" activeKey={sortKey} direction={sortDir} onSort={toggleSort} />
                <RawSortableTh label="SKU" sortKey="sku" activeKey={sortKey} direction={sortDir} onSort={toggleSort} />
                {canEdit && <th className="px-4 py-3 text-right font-medium">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {sortedColors.map((color) => (
                <tr key={color.id} className="border-b last:border-0 hover:bg-muted/20">
                  {editingId === color.id ? (
                    <>
                      <td className="px-4 py-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
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
                          <Button size="sm" onClick={() => handleUpdate(color.id)} disabled={editLoading}>
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
                      <td className="px-4 py-3">{color.name}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{color.sku}</td>
                      {canEdit && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => startEdit(color)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(color.id)}
                              disabled={deletingId === color.id}
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
