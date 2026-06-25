import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { variantService } from '@/services/variantService'
import { colorService } from '@/services/colorService'
import { VariantsCSVImport } from '@/components/VariantsCSVImport'
import type { BulkVariantInput } from '@/types/variant'
import type { Color } from '@/types/color'

type View = 'form' | 'import'

interface RowError {
  color_id?: string
  stock?: string
}

interface Row extends BulkVariantInput {
  id: number
}

const emptyRow = (id: number): Row => ({
  id,
  color_id: '',
  stock: 0,
})

let nextId = 1

export const VariantsBulkCreatePage = () => {
  const [view, setView] = useState<View>('form')
  const [colors, setColors] = useState<Color[]>([])
  const [rows, setRows] = useState<Row[]>([emptyRow(nextId++)])
  const [rowErrors, setRowErrors] = useState<Record<number, RowError>>({})
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  useEffect(() => {
    colorService.listColors().then(setColors).catch(() => {})
  }, [])

  const updateRow = (id: number, field: keyof BulkVariantInput, value: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row
        if (field === 'stock') {
          return { ...row, [field]: value === '' ? 0 : Number(value) }
        }
        return { ...row, [field]: value }
      })
    )
    setRowErrors((prev) => {
      const rowErr = { ...prev[id] }
      delete rowErr[field as keyof RowError]
      return { ...prev, [id]: rowErr }
    })
  }

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow(nextId++)])
  }

  const removeRow = (id: number) => {
    if (rows.length === 1) {
      const clearedId = nextId++
      setRows([emptyRow(clearedId)])
      setRowErrors({})
      return
    }
    setRows((prev) => prev.filter((row) => row.id !== id))
    setRowErrors((prev) => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
  }

  const validate = (): boolean => {
    const errors: Record<number, RowError> = {}
    let valid = true

    for (const row of rows) {
      const rowErr: RowError = {}
      if (!row.color_id) {
        rowErr.color_id = 'El color es requerido'
        valid = false
      }
      if (row.stock < 0) {
        rowErr.stock = 'El stock debe ser mayor o igual a cero'
        valid = false
      }
      if (Object.keys(rowErr).length > 0) {
        errors[row.id] = rowErr
      }
    }

    setRowErrors(errors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError(null)

    if (!validate()) return

    try {
      setLoading(true)
      const created = await variantService.bulkCreate({
        variants: rows.map(({ color_id, size_id, stock }) => ({
          color_id,
          size_id,
          stock,
        })),
      })
      toast.success(`${created.length} variante${created.length !== 1 ? 's' : ''} creada${created.length !== 1 ? 's' : ''} exitosamente`)
      setRows([emptyRow(nextId++)])
      setRowErrors({})
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Error al crear las variantes')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Crear Variantes</h1>
        <p className="mt-2 text-muted-foreground">
          Crea múltiples variantes de una vez. Pueden asignarse a productos después.
        </p>
      </div>

      {/* View toggle */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={view === 'form' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('form')}
        >
          Formulario
        </Button>
        <Button
          variant={view === 'import' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('import')}
        >
          Importar CSV
        </Button>
      </div>

      {view === 'import' && (
        <VariantsCSVImport
          onSuccess={() => setView('form')}
          onCancel={() => setView('form')}
        />
      )}

      {view === 'form' && (
        <form onSubmit={handleSubmit}>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-foreground">#</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Color *</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Stock *</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>

                    {/* Color */}
                    <td className="px-4 py-3">
                      <div className="min-w-[160px]">
                        <select
                          value={row.color_id}
                          onChange={(e) => updateRow(row.id, 'color_id', e.target.value)}
                          disabled={loading}
                          className={`w-full rounded-md border bg-background px-3 py-2 text-sm ${rowErrors[row.id]?.color_id ? 'border-destructive' : 'border-input'}`}
                        >
                          <option value="">Seleccionar color</option>
                          {colors.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.sku})
                            </option>
                          ))}
                        </select>
                        {rowErrors[row.id]?.color_id && (
                          <p className="mt-1 text-xs text-destructive">
                            {rowErrors[row.id]?.color_id}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <div className="min-w-[100px]">
                        <Input
                          type="number"
                          min="0"
                          value={row.stock}
                          onChange={(e) => updateRow(row.id, 'stock', e.target.value)}
                          disabled={loading}
                          className={rowErrors[row.id]?.stock ? 'border-destructive' : ''}
                        />
                        {rowErrors[row.id]?.stock && (
                          <p className="mt-1 text-xs text-destructive">
                            {rowErrors[row.id]?.stock}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Remove */}
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(row.id)}
                        disabled={loading}
                        title="Eliminar fila"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRow}
              disabled={loading}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar fila
            </Button>
          </div>

          {globalError && (
            <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {globalError}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : `Crear ${rows.length} variante${rows.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
