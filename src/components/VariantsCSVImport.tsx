import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { variantService } from '@/services/variantService'
import { productService } from '@/services/productService'
import { colorService } from '@/services/colorService'
import type { BulkVariantInput } from '@/types/variant'
import type { Product } from '@/types/product'
import type { Color } from '@/types/color'
import { Upload, Download } from 'lucide-react'

// Required columns; product_slug is optional
const REQUIRED_HEADERS = ['color_sku', 'stock', 'initial_cost']

const EXAMPLE_ROWS = [
  ['ROJO', '10', '5000', 'mono-rojo'],
  ['AZUL', '5', '5000', ''],
]

interface ParsedRow {
  index: number
  data: BulkVariantInput & { _slug?: string; _colorSKU?: string }
  error: string | null
}

function parseRow(
  rawValues: string[],
  index: number,
  hasSlugCol: boolean
): ParsedRow {
  const get = (i: number) => rawValues[i]?.trim() ?? ''

  const colorSKU = get(0)
  const stockRaw = get(1)
  const costRaw = get(2)
  const slug = hasSlugCol ? get(3) : ''

  const empty = {} as BulkVariantInput

  if (!colorSKU) return { index, data: empty, error: 'color_sku es requerido' }

  const stock = parseInt(stockRaw, 10)
  if (stockRaw === '' || isNaN(stock) || stock < 0) {
    return { index, data: empty, error: 'stock debe ser un número mayor o igual a 0' }
  }

  const initial_cost = parseFloat(costRaw)
  if (costRaw === '' || isNaN(initial_cost) || initial_cost < 0) {
    return { index, data: empty, error: 'initial_cost debe ser un número mayor o igual a 0' }
  }

  // color_id will be resolved after we fetch colors; use placeholder
  return {
    index,
    data: { color_id: '', stock, initial_cost, _slug: slug || undefined, _colorSKU: colorSKU },
    error: null,
  }
}

function parseCSV(text: string): {
  rows: ParsedRow[]
  headerError: string | null
  hasSlugCol: boolean
} {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length === 0) {
    return { rows: [], headerError: 'El archivo está vacío', hasSlugCol: false }
  }

  const headers = lines[0]!.split(',').map((h) => h.trim().toLowerCase())
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h))
  if (missing.length > 0) {
    return { rows: [], headerError: `Encabezados faltantes: ${missing.join(', ')}`, hasSlugCol: false }
  }

  const hasSlugCol = headers.includes('product_slug')
  const colIndex = (name: string) => headers.indexOf(name)
  const orderedCols = [...REQUIRED_HEADERS.map((h) => colIndex(h)), hasSlugCol ? colIndex('product_slug') : -1]

  const rows: ParsedRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const rawValues = lines[i]!.split(',')
    const reordered = orderedCols.map((ci) => (ci >= 0 ? (rawValues[ci] ?? '') : ''))
    rows.push(parseRow(reordered, i, hasSlugCol))
  }

  return { rows, headerError: null, hasSlugCol }
}

function downloadTemplate() {
  const headers = [...REQUIRED_HEADERS, 'product_slug']
  const content = [
    headers.join(','),
    ...EXAMPLE_ROWS.map((r) => r.join(',')),
  ].join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plantilla_variantes.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function resolveColorIds(rows: ParsedRow[], colors: Color[]): ParsedRow[] {
  const skuMap = new Map(colors.map((c) => [c.sku.toUpperCase(), c.id]))
  return rows.map((row) => {
    if (row.error || !row.data._colorSKU) return row
    const id = skuMap.get(row.data._colorSKU.toUpperCase())
    if (!id) {
      return { ...row, data: {} as BulkVariantInput, error: `color con SKU "${row.data._colorSKU}" no encontrado` }
    }
    return { ...row, data: { ...row.data, color_id: id } }
  })
}

function resolveProductIds(rows: ParsedRow[], products: Product[]): ParsedRow[] {
  const slugMap = new Map(products.map((p) => [p.slug, p.id]))
  return rows.map((row) => {
    if (row.error || !row.data._slug) return row
    const id = slugMap.get(row.data._slug)
    if (!id) {
      return { ...row, data: {} as BulkVariantInput, error: `producto con slug "${row.data._slug}" no encontrado` }
    }
    return { ...row, data: { ...row.data, product_id: id } }
  })
}

interface VariantsCSVImportProps {
  onSuccess: () => void
  onCancel: () => void
}

export const VariantsCSVImport = ({
  onSuccess,
  onCancel,
}: VariantsCSVImportProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [hasSlugCol, setHasSlugCol] = useState(false)
  const [headerError, setHeaderError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [createdCount, setCreatedCount] = useState<number | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [colors, setColors] = useState<Color[]>([])

  const validRows = rows.filter((r) => r.error === null)
  const invalidRows = rows.filter((r) => r.error !== null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setApiError(null)
    setCreatedCount(null)

    const text = await file.text()
    const { rows: parsed, headerError: hErr, hasSlugCol: slugCol } = parseCSV(text)
    setHeaderError(hErr)
    setHasSlugCol(slugCol)

    if (!hErr) {
      const [colorList, productList] = await Promise.all([
        colorService.listColors().catch(() => [] as Color[]),
        slugCol ? productService.listProducts({}).catch(() => [] as Product[]) : Promise.resolve([] as Product[]),
      ])
      setColors(colorList ?? [])
      setProducts(productList ?? [])
      let resolved = resolveColorIds(parsed, colorList ?? [])
      if (slugCol) resolved = resolveProductIds(resolved, productList ?? [])
      setRows(resolved)
    } else {
      setRows(parsed)
    }
  }

  const handleSubmit = async () => {
    if (validRows.length === 0) return
    setSubmitting(true)
    setApiError(null)
    try {
      const variants = validRows.map(({ data }) => {
        const { _slug, _colorSKU, ...rest } = data as BulkVariantInput & { _slug?: string; _colorSKU?: string }
        void _slug; void _colorSKU
        return rest
      })
      const created = await variantService.bulkCreate({ variants })
      setCreatedCount(created.length)
      onSuccess()
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload card */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Cargar archivo CSV</h3>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Descargar plantilla
          </Button>
        </div>

        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:bg-muted/50"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {fileName ? fileName : 'Haz clic para seleccionar un archivo CSV'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Requerido: color_sku, stock, initial_cost — Opcional: product_slug
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {headerError && (
          <p className="mt-3 text-sm text-destructive">{headerError}</p>
        )}
      </Card>

      {/* Preview */}
      {rows.length > 0 && !headerError && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">
            Vista previa —{' '}
            <span className="text-primary">{validRows.length} válidas</span>
            {invalidRows.length > 0 && (
              <span className="ml-2 text-destructive">
                / {invalidRows.length} con errores
              </span>
            )}
          </h3>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fila</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Costo Inicial</TableHead>
                  {hasSlugCol && <TableHead>Producto</TableHead>}
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.index}
                    className={row.error ? 'bg-destructive/5' : ''}
                  >
                    <TableCell>{row.index}</TableCell>
                    <TableCell>
                      {row.error ? '—' : (
                        <span>
                          {colors.find((c) => c.id === row.data.color_id)?.name ?? row.data._colorSKU ?? '—'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.error ? '—' : row.data.stock}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.error ? '—' : `$${row.data.initial_cost.toLocaleString('es-CO')}`}
                    </TableCell>
                    {hasSlugCol && (
                      <TableCell className="text-sm text-muted-foreground">
                        {row.error
                          ? '—'
                          : row.data.product_id
                            ? (products.find((p) => p.id === row.data.product_id)?.name ?? row.data.product_id)
                            : <span className="italic">Sin asignar</span>}
                      </TableCell>
                    )}
                    <TableCell>
                      {row.error ? (
                        <span className="text-xs text-destructive">{row.error}</span>
                      ) : (
                        <span className="text-xs text-green-600">✓ Válida</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* API error */}
      {apiError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {apiError}
        </div>
      )}

      {/* Success */}
      {createdCount !== null && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          {createdCount} variante(s) creadas exitosamente.
        </div>
      )}

      {/* Actions */}
      {rows.length > 0 && !headerError && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || validRows.length === 0}
          >
            {submitting ? (
              <><LoadingSpinner className="mr-2 h-4 w-4" /> Creando...</>
            ) : (
              `Crear ${validRows.length} variante(s)`
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
