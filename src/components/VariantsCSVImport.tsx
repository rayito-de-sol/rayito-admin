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
import { sizeService } from '@/services/sizeService'
import type { BulkVariantInput } from '@/types/variant'
import type { Product } from '@/types/product'
import type { Color } from '@/types/color'
import type { Size } from '@/types/size'
import { Upload, Download } from 'lucide-react'

// Required columns; product_sku and size_sku are optional
const REQUIRED_HEADERS = ['color_sku', 'stock']
const OPTIONAL_HEADERS = ['product_sku', 'size_sku']

const EXAMPLE_ROWS = [
  ['ROJO', '10', 'MONO', 'NINA'],
  ['AZUL', '5', '', ''],
]

interface ParsedRow {
  index: number
  data: BulkVariantInput & {
    _colorSKU?: string
    _productSKU?: string
    _sizeSKU?: string
  }
  error: string | null
}

function parseRow(values: Record<string, string>, index: number): ParsedRow {
  const colorSKU = (values.color_sku ?? '').trim()
  const stockRaw = (values.stock ?? '').trim()
  const productSKU = (values.product_sku ?? '').trim()
  const sizeSKU = (values.size_sku ?? '').trim()

  const empty = {} as BulkVariantInput

  if (!colorSKU) return { index, data: empty, error: 'color_sku es requerido' }

  const stock = parseInt(stockRaw, 10)
  if (stockRaw === '' || isNaN(stock) || stock < 0) {
    return { index, data: empty, error: 'stock debe ser un número mayor o igual a 0' }
  }

  // color_id / product_id / size_id are resolved after fetching catalog data
  return {
    index,
    data: {
      color_id: '',
      stock,
      _colorSKU: colorSKU,
      _productSKU: productSKU || undefined,
      _sizeSKU: sizeSKU || undefined,
    },
    error: null,
  }
}

function parseCSV(text: string): {
  rows: ParsedRow[]
  headerError: string | null
  hasProductCol: boolean
  hasSizeCol: boolean
} {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length === 0) {
    return { rows: [], headerError: 'El archivo está vacío', hasProductCol: false, hasSizeCol: false }
  }

  const headers = lines[0]!.split(',').map((h) => h.trim().toLowerCase())
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h))
  if (missing.length > 0) {
    return { rows: [], headerError: `Encabezados faltantes: ${missing.join(', ')}`, hasProductCol: false, hasSizeCol: false }
  }

  const hasProductCol = headers.includes('product_sku')
  const hasSizeCol = headers.includes('size_sku')

  const rows: ParsedRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const rawValues = lines[i]!.split(',')
    const values: Record<string, string> = {}
    headers.forEach((h, ci) => {
      values[h] = rawValues[ci] ?? ''
    })
    rows.push(parseRow(values, i))
  }

  return { rows, headerError: null, hasProductCol, hasSizeCol }
}

function downloadTemplate() {
  const headers = [...REQUIRED_HEADERS, ...OPTIONAL_HEADERS]
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
  const skuMap = new Map(products.map((p) => [p.sku.toUpperCase(), p.id]))
  return rows.map((row) => {
    if (row.error || !row.data._productSKU) return row
    const id = skuMap.get(row.data._productSKU.toUpperCase())
    if (!id) {
      return { ...row, data: {} as BulkVariantInput, error: `producto con SKU "${row.data._productSKU}" no encontrado` }
    }
    return { ...row, data: { ...row.data, product_id: id } }
  })
}

function resolveSizeIds(rows: ParsedRow[], sizes: Size[]): ParsedRow[] {
  const skuMap = new Map(
    sizes.filter((s) => s.sku).map((s) => [s.sku!.toUpperCase(), s.id])
  )
  return rows.map((row) => {
    if (row.error || !row.data._sizeSKU) return row
    const id = skuMap.get(row.data._sizeSKU.toUpperCase())
    if (!id) {
      return { ...row, data: {} as BulkVariantInput, error: `talla con SKU "${row.data._sizeSKU}" no encontrada` }
    }
    return { ...row, data: { ...row.data, size_id: id } }
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
  const [hasProductCol, setHasProductCol] = useState(false)
  const [hasSizeCol, setHasSizeCol] = useState(false)
  const [headerError, setHeaderError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [createdCount, setCreatedCount] = useState<number | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [colors, setColors] = useState<Color[]>([])
  const [sizes, setSizes] = useState<Size[]>([])

  const validRows = rows.filter((r) => r.error === null)
  const invalidRows = rows.filter((r) => r.error !== null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setApiError(null)
    setCreatedCount(null)

    const text = await file.text()
    const { rows: parsed, headerError: hErr, hasProductCol: productCol, hasSizeCol: sizeCol } = parseCSV(text)
    setHeaderError(hErr)
    setHasProductCol(productCol)
    setHasSizeCol(sizeCol)

    if (!hErr) {
      const [colorList, productList, sizeList] = await Promise.all([
        colorService.listColors().catch(() => [] as Color[]),
        productCol ? productService.listProducts({}).catch(() => [] as Product[]) : Promise.resolve([] as Product[]),
        sizeCol ? sizeService.listSizes().catch(() => [] as Size[]) : Promise.resolve([] as Size[]),
      ])
      setColors(colorList ?? [])
      setProducts(productList ?? [])
      setSizes(sizeList ?? [])
      let resolved = resolveColorIds(parsed, colorList ?? [])
      if (productCol) resolved = resolveProductIds(resolved, productList ?? [])
      if (sizeCol) resolved = resolveSizeIds(resolved, sizeList ?? [])
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
        const { _colorSKU, _productSKU, _sizeSKU, ...rest } = data
        void _colorSKU; void _productSKU; void _sizeSKU
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
            Requerido: color_sku, stock — Opcional: product_sku, size_sku
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
                  {hasProductCol && <TableHead>Producto</TableHead>}
                  {hasSizeCol && <TableHead>Talla</TableHead>}
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
                    {hasProductCol && (
                      <TableCell className="text-sm text-muted-foreground">
                        {row.error
                          ? '—'
                          : row.data.product_id
                            ? (products.find((p) => p.id === row.data.product_id)?.name ?? row.data.product_id)
                            : <span className="italic">Sin asignar</span>}
                      </TableCell>
                    )}
                    {hasSizeCol && (
                      <TableCell className="text-sm text-muted-foreground">
                        {row.error
                          ? '—'
                          : row.data.size_id
                            ? (sizes.find((s) => s.id === row.data.size_id)?.label ?? row.data.size_id)
                            : <span className="italic">Sin talla</span>}
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
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          {createdCount !== null ? 'Volver' : 'Cancelar'}
        </Button>
        {createdCount === null && (
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
              `Importar ${validRows.length} variante${validRows.length !== 1 ? 's' : ''}`
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
