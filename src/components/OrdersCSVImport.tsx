import { useRef, useState, type ChangeEvent } from 'react'
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
import {
  ordersService,
  type BulkOrdersResult,
  type HistoricalOrderRow,
} from '@/services/ordersService'
import type { OrderSource } from '@/types/order'
import { Upload, Download } from 'lucide-react'

const VALID_SOURCES: OrderSource[] = ['store', 'shopify', 'whatsapp']

const CSV_HEADERS = [
  'fecha',
  'canal',
  'referencia',
  'sku',
  'cantidad',
  'precio_unitario',
  'cliente',
  'notas',
]

const EXAMPLE_ROWS = [
  ['2025-03-10', 'whatsapp', 'F-001', 'mono-azul', '2', '10000', 'María', ''],
  ['2025-03-10', 'whatsapp', 'F-001', 'mono-rojo', '1', '8000', 'María', ''],
]

interface ParsedRow {
  index: number
  data: HistoricalOrderRow
  error: string | null
}

interface OrdersCSVImportProps {
  onSuccess: () => void
  onCancel: () => void
}

function parseRow(rawValues: string[], index: number): ParsedRow {
  const get = (i: number) => rawValues[i]?.trim() ?? ''

  const fecha = get(0)
  const canal = get(1).toLowerCase()
  const referencia = get(2)
  const sku = get(3)
  const cantidadRaw = get(4)
  const precioRaw = get(5)
  const cliente = get(6)
  const notas = get(7)

  const emptyData = {} as HistoricalOrderRow

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha))
    return { index, data: emptyData, error: 'fecha inválida (use YYYY-MM-DD)' }
  if (!VALID_SOURCES.includes(canal as OrderSource))
    return {
      index,
      data: emptyData,
      error: `canal inválido (debe ser: ${VALID_SOURCES.join(', ')})`,
    }
  if (!sku) return { index, data: emptyData, error: 'sku es requerido' }

  const cantidad = parseInt(cantidadRaw, 10)
  if (cantidadRaw === '' || isNaN(cantidad) || cantidad <= 0)
    return {
      index,
      data: emptyData,
      error: 'cantidad debe ser un número entero mayor a 0',
    }

  const precio = parseFloat(precioRaw)
  if (precioRaw === '' || isNaN(precio) || precio < 0)
    return {
      index,
      data: emptyData,
      error: 'precio_unitario debe ser un número mayor o igual a 0',
    }

  return {
    index,
    data: {
      date: fecha,
      source: canal as OrderSource,
      reference: referencia || undefined,
      sku,
      quantity: cantidad,
      unit_price: precio,
      customer_name: cliente || undefined,
      notes: notas || undefined,
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

  const orderedCols = CSV_HEADERS.map((h) => headers.indexOf(h))

  const rows: ParsedRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const rawValues = lines[i]!.split(',')
    const reordered = orderedCols.map((ci) => rawValues[ci] ?? '')
    rows.push(parseRow(reordered, i))
  }

  return { rows, headerError: null }
}

function downloadTemplate() {
  const content = [
    CSV_HEADERS.join(','),
    ...EXAMPLE_ROWS.map((r) => r.join(',')),
  ].join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plantilla_ventas_historicas.csv'
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * OrdersCSVImport
 * Carga inicial de ventas históricas desde CSV. Una fila por producto vendido;
 * las filas con la misma referencia se agrupan en un solo pedido. Los SKUs se
 * validan contra el catálogo en el servidor.
 */
export const OrdersCSVImport = ({
  onSuccess,
  onCancel,
}: OrdersCSVImportProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [headerError, setHeaderError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<BulkOrdersResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const validRows = rows.filter((r) => r.error === null)
  const invalidRows = rows.filter((r) => r.error !== null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
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
    if (validRows.length === 0 || invalidRows.length > 0) return
    setSubmitting(true)
    setApiError(null)
    try {
      const res = await ordersService.bulkCreateOrders(
        validRows.map((r) => r.data)
      )
      setResult(res)
      if (res.errors.length === 0) {
        onSuccess()
      }
    } catch (err) {
      console.error('Error importando ventas:', err)
      setApiError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
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
            {fileName ? fileName : 'Haz clic para seleccionar un archivo CSV'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Una fila por producto vendido. Filas con la misma referencia se
            agrupan en un pedido. No se descuenta inventario.
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
                  <TableHead>Fecha</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
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
                    <TableCell>{row.error ? '—' : row.data.date}</TableCell>
                    <TableCell>{row.error ? '—' : row.data.source}</TableCell>
                    <TableCell>
                      {row.error ? '—' : (row.data.reference ?? '—')}
                    </TableCell>
                    <TableCell>{row.error ? '—' : row.data.sku}</TableCell>
                    <TableCell className="text-right">
                      {row.error ? '—' : row.data.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.error
                        ? '—'
                        : `$${row.data.unit_price.toLocaleString('es-CO')}`}
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

          {invalidRows.length > 0 && (
            <p className="mt-3 text-sm text-destructive">
              Corrige las filas con errores antes de importar (la importación
              es todo o nada).
            </p>
          )}
        </Card>
      )}

      {apiError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {apiError}
        </div>
      )}

      {result && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">
            Resultado de importación
          </h3>
          <div className="mb-4 flex gap-6 text-sm">
            <span className="text-green-600">
              Pedidos creados: <strong>{result.orders_created}</strong>
            </span>
            {result.skipped > 0 && (
              <span className="text-muted-foreground">
                Omitidos (referencia ya importada):{' '}
                <strong>{result.skipped}</strong>
              </span>
            )}
            {result.errors.length > 0 && (
              <span className="text-destructive">
                Errores: <strong>{result.errors.length}</strong>
              </span>
            )}
          </div>

          {result.errors.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fila</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.errors.map((e) => (
                  <TableRow key={`${e.row}-${e.error}`}>
                    <TableCell>{e.row}</TableCell>
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

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          {result && result.errors.length === 0 ? 'Volver' : 'Cancelar'}
        </Button>
        {!result && (
          <Button
            onClick={handleSubmit}
            disabled={
              submitting || validRows.length === 0 || invalidRows.length > 0
            }
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Importando...
              </>
            ) : (
              `Importar ${validRows.length} fila${validRows.length !== 1 ? 's' : ''}`
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
