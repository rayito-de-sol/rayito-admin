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
import { storesService } from '@/services/stores'
import type { CreateStoreRequest, BulkImportResult } from '@/types/store'
import { Upload, Download } from 'lucide-react'

const IDENTITY_TYPES = ['NIT', 'RUT', 'CC', 'CE', 'RFC']

const CSV_HEADERS = [
  'identity_number',
  'identity_type',
  'name',
  'legal_name',
  'line1',
  'line2',
  'city',
  'state',
  'postal_code',
  'country',
  'contact_person_name',
  'contact_person_email',
  'contact_phone_number',
  'discount_percentage',
  'deduct_vat',
  'include_products_detail',
  'include_unit_value',
  'include_sku_in_detail',
  'detail_in_appendix',
  'include_legal_income_note',
]

const EXAMPLE_ROW = [
  '900123456',
  'NIT',
  'Tienda Ejemplo',
  'Tienda Ejemplo S.A.S',
  'Calle 10 # 20-30',
  '',
  'Bogotá',
  'Cundinamarca',
  '110111',
  'CO',
  'Juan Pérez',
  'juan@ejemplo.com',
  '3001234567',
  '10',
  'false',
  'true',
  'false',
  'false',
  'false',
  'false',
]

interface ParsedRow {
  index: number
  data: CreateStoreRequest
  error: string | null
}

interface StoresCSVImportProps {
  onSuccess: () => void
  onCancel: () => void
}

function parseBool(value: string): boolean {
  return value.trim().toLowerCase() === 'true' || value.trim() === '1'
}

function parseRow(
  rawValues: string[],
  index: number
): ParsedRow {
  const get = (i: number) => rawValues[i]?.trim() ?? ''

  const identityNumber = get(0)
  const identityType = get(1)
  const name = get(2)
  const legalName = get(3)
  const line1 = get(4)
  const line2 = get(5)
  const city = get(6)
  const state = get(7)
  const postalCode = get(8)
  const country = get(9)
  const contactPersonName = get(10)
  const contactPersonEmail = get(11)
  const contactPhoneNumber = get(12)
  const discountRaw = get(13)
  const discountPercentage = discountRaw === '' ? 0 : parseFloat(discountRaw)

  // Client-side validation
  if (!identityNumber) return { index, data: {} as CreateStoreRequest, error: 'identity_number es requerido' }
  if (!IDENTITY_TYPES.includes(identityType))
    return { index, data: {} as CreateStoreRequest, error: `identity_type inválido (debe ser uno de: ${IDENTITY_TYPES.join(', ')})` }
  if (!name) return { index, data: {} as CreateStoreRequest, error: 'name es requerido' }
  if (!legalName) return { index, data: {} as CreateStoreRequest, error: 'legal_name es requerido' }
  if (!line1) return { index, data: {} as CreateStoreRequest, error: 'line1 es requerido' }
  if (!city) return { index, data: {} as CreateStoreRequest, error: 'city es requerido' }
  if (!state) return { index, data: {} as CreateStoreRequest, error: 'state es requerido' }
  if (!postalCode) return { index, data: {} as CreateStoreRequest, error: 'postal_code es requerido' }
  if (!/^[A-Za-z]{2}$/.test(country))
    return { index, data: {} as CreateStoreRequest, error: 'country debe ser un código ISO de 2 letras (ej: CO)' }
  if (!contactPersonName)
    return { index, data: {} as CreateStoreRequest, error: 'contact_person_name es requerido' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactPersonEmail))
    return { index, data: {} as CreateStoreRequest, error: 'contact_person_email tiene formato inválido' }
  if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100)
    return { index, data: {} as CreateStoreRequest, error: 'discount_percentage debe estar entre 0 y 100' }

  const data: CreateStoreRequest = {
    identity_number: identityNumber,
    identity_type: identityType,
    name,
    legal_name: legalName,
    line1,
    line2: line2 || undefined,
    city,
    state,
    postal_code: postalCode,
    country: country.toUpperCase(),
    contact_person_name: contactPersonName,
    contact_person_email: contactPersonEmail.toLowerCase(),
    contact_phone_number: contactPhoneNumber,
    discount_percentage: discountPercentage,
    deduct_vat: parseBool(get(14)),
    include_products_detail: parseBool(get(15)),
    include_unit_value: parseBool(get(16)),
    include_sku_in_detail: parseBool(get(17)),
    detail_in_appendix: parseBool(get(18)),
    include_legal_income_note: parseBool(get(19)),
  }

  return { index, data, error: null }
}

function parseCSV(text: string): { rows: ParsedRow[]; headerError: string | null } {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length === 0) return { rows: [], headerError: 'El archivo está vacío' }

  // Validate headers
  const headers = lines[0]!.split(',').map((h) => h.trim().toLowerCase())
  const missingHeaders = CSV_HEADERS.filter((h) => !headers.includes(h))
  if (missingHeaders.length > 0) {
    return {
      rows: [],
      headerError: `Encabezados faltantes: ${missingHeaders.join(', ')}`,
    }
  }

  // Build column index map from actual header order
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
  a.download = 'plantilla_tiendas.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export const StoresCSVImport = ({ onSuccess, onCancel }: StoresCSVImportProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [headerError, setHeaderError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<BulkImportResult | null>(null)
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
      const res = await storesService.bulkCreateStores(validRows.map((r) => r.data))
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
            {fileName ? fileName : 'Haz clic para seleccionar un archivo CSV'}
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
                  <TableHead>N° Identificación</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Email Contacto</TableHead>
                  <TableHead>Descuento %</TableHead>
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
                      {row.error ? '—' : row.data.identity_number}
                    </TableCell>
                    <TableCell>
                      {row.error ? '—' : row.data.identity_type}
                    </TableCell>
                    <TableCell>{row.error ? '—' : row.data.name}</TableCell>
                    <TableCell>{row.error ? '—' : row.data.city}</TableCell>
                    <TableCell>
                      {row.error ? '—' : row.data.contact_person_email}
                    </TableCell>
                    <TableCell>
                      {row.error ? '—' : `${row.data.discount_percentage}%`}
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
          <h3 className="mb-4 text-lg font-semibold">Resultado de importación</h3>
          <div className="mb-4 flex gap-6 text-sm">
            <span>
              Total: <strong>{result.total}</strong>
            </span>
            <span className="text-green-600">
              Creadas: <strong>{result.created}</strong>
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
                  <TableHead>N° Identificación</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.errors.map((e) => (
                  <TableRow key={e.row}>
                    <TableCell>{e.row}</TableCell>
                    <TableCell>{e.identity_number}</TableCell>
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
              `Importar ${validRows.length} tienda${validRows.length !== 1 ? 's' : ''}`
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
