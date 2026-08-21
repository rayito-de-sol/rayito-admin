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

const categoryLabel = (c: string) =>
  EXPENSE_CATEGORY_LABELS[c as ExpenseCategory] ?? c

interface ConceptRow {
  label: string
  getValue: (m: IncomeStatementMonth) => number
  rowClass?: string
  cellClass?: (value: number) => string
  // Niveles de indentación para mostrar jerarquía (0 = concepto principal)
  indent?: number
  // Presente cuando la fila puede expandirse para mostrar su detalle
  expand?: { open: boolean; toggle: () => void; label: string }
}

// Filas de detalle por categoría, indentadas bajo su concepto padre
const categoryRows = (
  categories: string[],
  getMap: (m: IncomeStatementMonth) => Record<string, number>,
  indent: number
): ConceptRow[] =>
  categories.map((c) => ({
    label: categoryLabel(c),
    getValue: (m: IncomeStatementMonth) => getMap(m)[c] ?? 0,
    indent,
  }))

/**
 * IncomeStatementTable
 * Estado de resultados: conceptos como filas y meses como columnas.
 * COGS proviene de gastos de producción; los gastos operativos se
 * dividen en administrativos y de ventas, ambos expandibles.
 */
export const IncomeStatementTable = ({
  statement,
}: IncomeStatementTableProps) => {
  const [showCogsDetail, setShowCogsDetail] = useState(false)
  const [showExpenseDetail, setShowExpenseDetail] = useState(false)

  const cogsCategories = Object.keys(statement.totals.cogs.by_category)
  const adminCategories = Object.keys(
    statement.totals.expenses.admin.by_category
  )
  const salesCategories = Object.keys(
    statement.totals.expenses.sales.by_category
  )

  const rows: ConceptRow[] = [
    { label: 'Ingresos', getValue: (m) => m.revenue },
    {
      label: 'Costo de ventas',
      getValue: (m) => m.cogs.total,
      expand: {
        open: showCogsDetail,
        toggle: () => setShowCogsDetail((v) => !v),
        label: 'detalle de costo de ventas',
      },
    },
    ...(showCogsDetail
      ? categoryRows(cogsCategories, (m) => m.cogs.by_category, 1)
      : []),
    {
      label: 'Utilidad bruta',
      getValue: (m) => m.gross_profit,
      rowClass: 'border-t',
      cellClass: () => 'font-medium',
    },
    {
      label: 'Gastos operativos',
      getValue: (m) => m.expenses.total,
      expand: {
        open: showExpenseDetail,
        toggle: () => setShowExpenseDetail((v) => !v),
        label: 'detalle de gastos operativos',
      },
    },
    ...(showExpenseDetail
      ? [
          {
            label: 'Gastos administrativos',
            getValue: (m: IncomeStatementMonth) => m.expenses.admin.total,
            indent: 1,
          },
          ...categoryRows(
            adminCategories,
            (m) => m.expenses.admin.by_category,
            2
          ),
          {
            label: 'Gastos de ventas',
            getValue: (m: IncomeStatementMonth) => m.expenses.sales.total,
            indent: 1,
          },
          ...categoryRows(
            salesCategories,
            (m) => m.expenses.sales.by_category,
            2
          ),
        ]
      : []),
    {
      label: 'Utilidad neta',
      getValue: (m) => m.net_income,
      rowClass: 'bg-muted/50',
      cellClass: (v) => `font-semibold ${netClass(v)}`,
    },
  ]

  const indentClass = (indent?: number) => {
    if (indent === 1) return 'pl-10 text-muted-foreground whitespace-nowrap'
    if (indent === 2) return 'pl-16 text-muted-foreground whitespace-nowrap'
    return 'whitespace-nowrap'
  }

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
            {/* key por índice: una misma categoría (p. ej. Nómina) puede
                aparecer en COGS y en gastos operativos a la vez */}
            {rows.map((row, i) => (
              <TableRow key={i} className={row.rowClass}>
                <TableCell className={indentClass(row.indent)}>
                  {row.expand ? (
                    <button
                      type="button"
                      onClick={row.expand.toggle}
                      className="flex items-center gap-1 hover:text-primary"
                      aria-expanded={row.expand.open}
                      aria-label={
                        row.expand.open
                          ? `Ocultar ${row.expand.label}`
                          : `Ver ${row.expand.label}`
                      }
                    >
                      {row.expand.open ? (
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
