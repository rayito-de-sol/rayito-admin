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
} from '../types/finance.types'

interface IncomeStatementTableProps {
  statement: IncomeStatement
}

const monthLabel = (year: number, month: number) =>
  `${MONTH_NAMES[month - 1]} ${year}`

const netClass = (value: number) =>
  value < 0 ? 'text-destructive font-medium' : 'font-medium'

/**
 * IncomeStatementTable
 * Estado de resultados mensual: ingresos, costo de ventas, gastos y utilidad.
 */
export const IncomeStatementTable = ({
  statement,
}: IncomeStatementTableProps) => {
  const categories = Object.keys(
    statement.totals.expenses_by_category
  ) as ExpenseCategory[]

  return (
    <div className="space-y-6">
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mes</TableHead>
                <TableHead className="text-right">Ingresos</TableHead>
                <TableHead className="text-right">Costo de ventas</TableHead>
                <TableHead className="text-right">Utilidad bruta</TableHead>
                <TableHead className="text-right">Gastos operativos</TableHead>
                <TableHead className="text-right">Utilidad neta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statement.months.map((m) => (
                <TableRow key={`${m.year}-${m.month}`}>
                  <TableCell>{monthLabel(m.year, m.month)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(m.revenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(m.cogs)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(m.gross_profit)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(m.total_expenses)}
                  </TableCell>
                  <TableCell className={`text-right ${netClass(m.net_income)}`}>
                    {formatCurrency(m.net_income)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell className="font-semibold">Total</TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(statement.totals.revenue)}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(statement.totals.cogs)}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(statement.totals.gross_profit)}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(statement.totals.total_expenses)}
                </TableCell>
                <TableCell
                  className={`text-right font-semibold ${netClass(statement.totals.net_income)}`}
                >
                  {formatCurrency(statement.totals.net_income)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>

      {categories.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">
            Gastos del periodo por categoría
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c}>
                  <TableCell>{EXPENSE_CATEGORY_LABELS[c] ?? c}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(statement.totals.expenses_by_category[c] ?? 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
