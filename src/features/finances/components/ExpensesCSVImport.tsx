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
import { financesApi } from '../api/financesApi'
import {
  EXPENSE_CATEGORIES,
  PAYMENT_METHOD_LABELS,
  type BulkCreateResult,
  type CreateExpenseRequest,
  type ExpenseCategory,
  type ExpensePaymentMethod,
} from '../types/finance.types'
import { Upload, Download } from 'lucide-react'

const CSV_HEADERS = [
  'fecha',
  'categoria',
  'descripcion',
  'monto',
  'metodo_pago',
  'notas',
]

const EXAMPLE_ROW = [
  '2026-01-15',
  'materiales',
  'Compra de telas',
  '150000',
  'transferencia',
  'Proveedor La Feria',
]

interface ParsedRow {
  index: number
  data: CreateExpenseRequest
  error: string | null
}

interface ExpensesCSVImportProps {
  onSuccess: () => void
  onCancel: () => void
}

function parseRow(rawValues: string[], index: number): ParsedRow {
  const get = (i: number) => rawValues[i]?.trim() ?? ''

  const fecha = get(0)
  const categoria = get(1).toLowerCase()
  const descripcion = get(2)
  const montoRaw = get(3)
  const metodoPago = get(4).toLowerCase()
  const notas = get(5)

  const emptyData = {} as CreateExpenseRequest

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha))
    return { index, data: emptyData, error: 'fecha inválida (use YYYY-MM-DD)' }
  if (!EXPENSE_CATEGORIES.includes(categoria as ExpenseCategory))
    return {
      index,
      data: emptyData,
      error: `categoria inválida (debe ser: ${EXPENSE_CATEGORIES.join(', ')})`,
    }
  if (!descripcion)
    return { index, data: emptyData, error: 'descripcion es requerida' }

  const monto = parseFloat(montoRaw)
  if (montoRaw === '' || isNaN(monto) || monto <= 0)
    return {
      index,
      data: emptyData,
      error: 'monto debe ser un número mayor a 0',
    }

  if (metodoPago && !(metodoPago in PAYMENT_METHOD_LABELS))
    return {
      index,
      data: emptyData,
      error: `metodo_pago inválido (debe ser: ${Object.keys(PAYMENT_METHOD_LABELS).join(', ')} o vacío)`,
    }

  return {
    index,
    data: {
      expense_date: fecha,
      category: categoria as ExpenseCategory,
      description: descripcion,
      amount: monto,
      payment_method: metodoPago
        ? (metodoPago as ExpensePaymentMethod)
        : undefined,
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
  const content = [CSV_HEADERS.join(','), EXAMPLE_ROW.join(',')].join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'plantilla_gastos.csv'
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * ExpensesCSVImport
 * Carga inicial de gastos desde un archivo CSV con vista previa.
 */
export const ExpensesCSVImport = ({
  onSuccess,
  onCancel,
}: ExpensesCSVImportProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [headerError, setHeaderError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<BulkCreateResult | null>(null)
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
    if (validRows.length === 0 || invalidRows.length > 0) return
    setSubmitting(true)
    setApiError(null)
    try {
      const res = await financesApi.bulkCreateExpenses(
        validRows.map((r) => r.data)
      )
      setResult(res)
      if (res.errors.length === 0) {
        onSuccess()
      }
    } catch (err) {
      console.error('Error importando gastos:', err)
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
            Fechas en formato YYYY-MM-DD. La importación es todo o nada.
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
                  <TableHead>Categoría</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
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
                      {row.error ? '—' : row.data.expense_date}
                    </TableCell>
                    <TableCell>{row.error ? '—' : row.data.category}</TableCell>
                    <TableCell>
                      {row.error ? '—' : row.data.description}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.error
                        ? '—'
                        : `$${row.data.amount.toLocaleString('es-CO')}`}
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

      {result && result.errors.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Errores del servidor</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fila</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.errors.map((e) => (
                <TableRow key={e.row}>
                  <TableCell>{e.row}</TableCell>
                  <TableCell className="text-destructive text-xs">
                    {e.error}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              `Importar ${validRows.length} gasto${validRows.length !== 1 ? 's' : ''}`
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
