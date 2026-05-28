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
import { productService } from '@/services/productService'
import type { BulkImportProductResult } from '@/types/product'
import { Upload, Download } from 'lucide-react'

const VALID_CATEGORIES = [
  'set',
  'turbante',
  'cintillo',
  'pinza',
  'maximono',
  'mono',
  'diadema',
  'otro',
]

const CSV_HEADERS = [
  'name',
  'slug',
  'sku_prefix',
  'description',
  'category',
  'initial_price',
  'tags',
]

const EXAMPLE_ROW = [
  'Turbante Clásico',
  'turbante-clasico',
  'TUR',
  'Turbante de tela premium',
  'turbante',
  '25000',
  'nuevo;verano',
]

interface BulkProductInput {
  name: string
  slug: string
  sku_prefix: string
  description: string
  category: string
  tags: string
  initial_price: number
}

interface ParsedRow {
  index: number
  data: BulkProductInput
  error: string | null
}

interface ProductsCSVImportProps {
  onSuccess: () => void
  onCancel: () => void
}

function parseRow(rawValues: string[], index: number): ParsedRow {
  const get = (i: number) => rawValues[i]?.trim() ?? ''

  const name = get(0)
  const slug = get(1)
  const skuPrefix = get(2)
  const description = get(3)
  const category = get(4)
  const priceRaw = get(5)
  const tags = get(6)

  const emptyData = {} as BulkProductInput

  if (!name) return { index, data: emptyData, error: 'name es requerido' }
  if (!slug) return { index, data: emptyData, error: 'slug es requerido' }
  if (!skuPrefix)
    return { index, data: emptyData, error: 'sku_prefix es requerido' }
  if (!category)
    return { index, data: emptyData, error: 'category es requerido' }
  if (!VALID_CATEGORIES.includes(category.toLowerCase()))
    return {
      index,
      data: emptyData,
      error: `category inválida (debe ser: ${VALID_CATEGORIES.join(', ')})`,
    }

  const initialPrice = parseFloat(priceRaw)
  if (priceRaw === '' || isNaN(initialPrice) || initialPrice < 0)
    return {
      index,
      data: emptyData,
      error: 'initial_price debe ser un número mayor o igual a 0',
    }

  return {
    index,
    data: {
      name,
      slug,
      sku_prefix: skuPrefix,
      description,
      category: category.toLowerCase(),
      tags,
      initial_price: initialPrice,
    },
    error: null,
  }
}

function parseCSV(text: string): {
  rows: ParsedRow[]
  headerError: string | null
} {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length === 0)
    return { rows: [], headerError: 'El archivo está vacío' }

  const headers = lines[0]!.split(',').map((h) => h.trim().toLowerCase())
  const missingHeaders = CSV_HEADERS.filter((h) => !headers.includes(h))
  if (missingHeaders.length > 0) {
    return {
      rows: [],
      headerError: `Encabezados faltantes: ${missingHeaders.join(', ')}`,
    }
  }

  const colIndex = (name: string) => headers.indexOf(name)
  const orderedCols = CSV_HEADERS.map((h) => colIndex(h))

  const rows: ParsedRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const rawValues = lines[i]!.split(',')
    const reordered = orderedCols.map((ci) => rawValues[ci] ?? '')
    rows.push(parseRow(reordered, i))
  }

  return { rows, headerError: null }
}

function downloadTemplate() {
  const content = [CSV_HEADERS.join(','), EXAMPLE_ROW.join(',')].join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plantilla_productos.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export const ProductsCSVImport = ({
  onSuccess,
  onCancel,
}: ProductsCSVImportProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [headerError, setHeaderError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<BulkImportProductResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const validRows = rows.filter((r) => r.error === null)
  const invalidRows = rows.filter((r) => r.error !== null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setResult(null)
    setApiError(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const { rows: parsed, headerError: hErr } = parseCSV(text)
      setHeaderError(hErr)
      setRows(parsed)
    }
    reader.readAsText(file)
  }

  const handleSubmit = async () => {
    if (validRows.length === 0) return
    setSubmitting(true)
    setApiError(null)
    try {
      const res = await productService.bulkCreateProducts(
        validRows.map((r) => r.data)
      )
      setResult(res)
      if (res.failed === 0) {
        onSuccess()
      }
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* File upload card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Cargar archivo CSV</h3>
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Descargar plantilla
          </Button>
        </div>

        <div
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {fileName
              ? fileName
              : 'Haz clic para seleccionar un archivo CSV'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Solo productos de tipo simple. Las etiquetas van separadas por punto y coma (;).
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
              <span className="text-destructive ml-2">
                / {invalidRows.length} con errores
              </span>
            )}
          </h3>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fila</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>SKU Prefijo</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
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
                    <TableCell>{row.error ? '—' : row.data.name}</TableCell>
                    <TableCell>{row.error ? '—' : row.data.slug}</TableCell>
                    <TableCell>
                      {row.error ? '—' : row.data.sku_prefix}
                    </TableCell>
                    <TableCell>{row.error ? '—' : row.data.category}</TableCell>
                    <TableCell className="text-right">
                      {row.error
                        ? '—'
                        : `$${row.data.initial_price.toLocaleString('es-CO')}`}
                    </TableCell>
                    <TableCell>
                      {row.error ? (
                        <span className="text-destructive text-xs">
                          {row.error}
                        </span>
                      ) : (
                        <span className="text-green-600 text-xs">✓ Válida</span>
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

      {/* Import result */}
      {result && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">
            Resultado de importación
          </h3>
          <div className="mb-4 flex gap-6 text-sm">
            <span>
              Total: <strong>{result.total}</strong>
            </span>
            <span className="text-green-600">
              Creados: <strong>{result.created}</strong>
            </span>
            {result.failed > 0 && (
              <span className="text-destructive">
                Errores: <strong>{result.failed}</strong>
              </span>
            )}
          </div>

          {result.errors.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fila</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.errors.map((e) => (
                  <TableRow key={e.row}>
                    <TableCell>{e.row}</TableCell>
                    <TableCell>{e.name}</TableCell>
                    <TableCell className="text-destructive text-xs">
                      {e.error}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          {result && result.failed === 0 ? 'Volver' : 'Cancelar'}
        </Button>
        {!result && (
          <Button
            onClick={handleSubmit}
            disabled={submitting || validRows.length === 0}
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Importando...
              </>
            ) : (
              `Importar ${validRows.length} producto${validRows.length !== 1 ? 's' : ''}`
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
