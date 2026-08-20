import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/utils/currency'
import { MONTH_NAMES } from './MonthRangePicker'
import type { CashFlow, CashFlowMonth } from '../types/finance.types'

interface CashFlowTableProps {
  cashFlow: CashFlow
}

const netClass = (value: number) =>
  value < 0 ? 'text-destructive font-medium' : 'font-medium'

interface ConceptRow {
  label: string
  getValue: (m: CashFlowMonth) => number
  rowClass?: string
  cellClass?: (value: number) => string
  indent?: boolean
  // El acumulado no tiene total del periodo (es un saldo, no una suma)
  showTotal?: boolean
}

/**
 * CashFlowTable
 * Flujo de caja (método directo, base efectivo):
 * conceptos como filas y meses como columnas.
 * "Entradas" es expandible para ver su detalle (ventas directas + cuentas de cobro).
 */
export const CashFlowTable = ({ cashFlow }: CashFlowTableProps) => {
  const [showInflowDetail, setShowInflowDetail] = useState(false)

  const rows: ConceptRow[] = [
    {
      label: 'Entradas',
      getValue: (m) => m.total_in,
      cellClass: () => 'font-medium',
    },
    ...(showInflowDetail
      ? [
          {
            label: 'Ventas directas',
            getValue: (m: CashFlowMonth) => m.sales_receipts,
            indent: true,
          },
          {
            label: 'Cuentas de cobro',
            getValue: (m: CashFlowMonth) => m.collection_receipts,
            indent: true,
          },
        ]
      : []),
    { label: 'Salidas (gastos)', getValue: (m) => m.total_out },
    {
      label: 'Neto',
      getValue: (m) => m.net,
      rowClass: 'bg-muted/50',
      cellClass: (v) => `font-semibold ${netClass(v)}`,
    },
    {
      label: 'Acumulado',
      getValue: (m) => m.cumulative,
      cellClass: netClass,
      showTotal: false,
    },
  ]

  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concepto</TableHead>
              {cashFlow.months.map((m) => (
                <TableHead
                  key={`${m.year}-${m.month}`}
                  className="text-right whitespace-nowrap"
                >
                  {MONTH_NAMES[m.month - 1]} {m.year}
                </TableHead>
              ))}
              <TableHead className="text-right font-semibold">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label} className={row.rowClass}>
                <TableCell
                  className={
                    row.indent
                      ? 'pl-10 text-muted-foreground whitespace-nowrap'
                      : 'whitespace-nowrap'
                  }
                >
                  {row.label === 'Entradas' ? (
                    <button
                      type="button"
                      onClick={() => setShowInflowDetail((v) => !v)}
                      className="flex items-center gap-1 font-medium hover:text-primary"
                      aria-expanded={showInflowDetail}
                      aria-label={
                        showInflowDetail
                          ? 'Ocultar detalle de entradas'
                          : 'Ver detalle de entradas'
                      }
                    >
                      {showInflowDetail ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {row.label}
                    </button>
                  ) : (
                    row.label
                  )}
                </TableCell>
                {cashFlow.months.map((m) => {
                  const value = row.getValue(m)
                  return (
                    <TableCell
                      key={`${m.year}-${m.month}`}
                      className={`text-right ${row.cellClass?.(value) ?? ''}`}
                    >
                      {formatCurrency(value)}
                    </TableCell>
                  )
                })}
                <TableCell
                  className={`text-right font-semibold ${
                    row.showTotal === false
                      ? ''
                      : (row.cellClass?.(row.getValue(cashFlow.totals)) ?? '')
                  }`}
                >
                  {row.showTotal === false
                    ? '—'
                    : formatCurrency(row.getValue(cashFlow.totals))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
