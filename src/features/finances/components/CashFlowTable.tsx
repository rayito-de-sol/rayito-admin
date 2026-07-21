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
import type { CashFlow } from '../types/finance.types'

interface CashFlowTableProps {
  cashFlow: CashFlow
}

const netClass = (value: number) =>
  value < 0 ? 'text-destructive font-medium' : 'font-medium'

/**
 * CashFlowTable
 * Flujo de caja mensual (método directo, base efectivo).
 */
export const CashFlowTable = ({ cashFlow }: CashFlowTableProps) => (
  <Card className="p-0 overflow-hidden">
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mes</TableHead>
            <TableHead className="text-right">Ventas directas</TableHead>
            <TableHead className="text-right">Cuentas de cobro</TableHead>
            <TableHead className="text-right">Entradas</TableHead>
            <TableHead className="text-right">Salidas (gastos)</TableHead>
            <TableHead className="text-right">Neto</TableHead>
            <TableHead className="text-right">Acumulado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cashFlow.months.map((m) => (
            <TableRow key={`${m.year}-${m.month}`}>
              <TableCell>
                {MONTH_NAMES[m.month - 1]} {m.year}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(m.sales_receipts)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(m.collection_receipts)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(m.total_in)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(m.total_out)}
              </TableCell>
              <TableCell className={`text-right ${netClass(m.net)}`}>
                {formatCurrency(m.net)}
              </TableCell>
              <TableCell className={`text-right ${netClass(m.cumulative)}`}>
                {formatCurrency(m.cumulative)}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-muted/50">
            <TableCell className="font-semibold">Total</TableCell>
            <TableCell className="text-right font-semibold">
              {formatCurrency(cashFlow.totals.sales_receipts)}
            </TableCell>
            <TableCell className="text-right font-semibold">
              {formatCurrency(cashFlow.totals.collection_receipts)}
            </TableCell>
            <TableCell className="text-right font-semibold">
              {formatCurrency(cashFlow.totals.total_in)}
            </TableCell>
            <TableCell className="text-right font-semibold">
              {formatCurrency(cashFlow.totals.total_out)}
            </TableCell>
            <TableCell
              className={`text-right font-semibold ${netClass(cashFlow.totals.net)}`}
            >
              {formatCurrency(cashFlow.totals.net)}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </Card>
)
