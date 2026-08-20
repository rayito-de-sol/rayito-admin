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
  // El acumulado no tiene total del periodo (es un saldo, no una suma)
  showTotal?: boolean
}

/**
 * CashFlowTable
 * Flujo de caja (método directo, base efectivo):
 * conceptos como filas y meses como columnas.
 */
export const CashFlowTable = ({ cashFlow }: CashFlowTableProps) => {
  const rows: ConceptRow[] = [
    { label: 'Ventas directas', getValue: (m) => m.sales_receipts },
    { label: 'Cuentas de cobro', getValue: (m) => m.collection_receipts },
    {
      label: 'Entradas',
      getValue: (m) => m.total_in,
      rowClass: 'border-t',
      cellClass: () => 'font-medium',
    },
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
                <TableCell className="whitespace-nowrap">{row.label}</TableCell>
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
