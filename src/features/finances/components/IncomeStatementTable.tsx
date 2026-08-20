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
import {
  EXPENSE_CATEGORY_LABELS,
  type ExpenseCategory,
  type IncomeStatement,
  type IncomeStatementMonth,
} from '../types/finance.types'

interface IncomeStatementTableProps {
  statement: IncomeStatement
}

const monthLabel = (year: number, month: number) =>
  `${MONTH_NAMES[month - 1]} ${year}`

const netClass = (value: number) =>
  value < 0 ? 'text-destructive font-medium' : 'font-medium'

interface ConceptRow {
  label: string
  getValue: (m: IncomeStatementMonth) => number
  rowClass?: string
  cellClass?: (value: number) => string
  indent?: boolean
}

/**
 * IncomeStatementTable
 * Estado de resultados: conceptos como filas y meses como columnas.
 */
export const IncomeStatementTable = ({
  statement,
}: IncomeStatementTableProps) => {
  const categories = Object.keys(
    statement.totals.expenses_by_category
  ) as ExpenseCategory[]

  const rows: ConceptRow[] = [
    { label: 'Ingresos', getValue: (m) => m.revenue },
    { label: 'Costo de ventas', getValue: (m) => m.cogs },
    {
      label: 'Utilidad bruta',
      getValue: (m) => m.gross_profit,
      rowClass: 'border-t',
      cellClass: () => 'font-medium',
    },
    ...categories.map((c) => ({
      label: EXPENSE_CATEGORY_LABELS[c] ?? c,
      getValue: (m: IncomeStatementMonth) => m.expenses_by_category[c] ?? 0,
      indent: true,
    })),
    { label: 'Gastos operativos', getValue: (m) => m.total_expenses },
    {
      label: 'Utilidad neta',
      getValue: (m) => m.net_income,
      rowClass: 'bg-muted/50',
      cellClass: (v) => `font-semibold ${netClass(v)}`,
    },
  ]

  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concepto</TableHead>
              {statement.months.map((m) => (
                <TableHead
                  key={`${m.year}-${m.month}`}
                  className="text-right whitespace-nowrap"
                >
                  {monthLabel(m.year, m.month)}
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
                      ? 'pl-8 text-muted-foreground whitespace-nowrap'
                      : 'whitespace-nowrap'
                  }
                >
                  {row.label}
                </TableCell>
                {statement.months.map((m) => {
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
                  className={`text-right font-semibold ${row.cellClass?.(row.getValue(statement.totals)) ?? ''}`}
                >
                  {formatCurrency(row.getValue(statement.totals))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
