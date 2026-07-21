import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import {
  MonthRangePicker,
  IncomeStatementTable,
  CashFlowTable,
  BalanceSheetView,
  financesApi,
  type IncomeStatement,
  type CashFlow,
  type BalanceSheet,
} from '@/features/finances'
import { useAuthStore } from '@/stores/useAuthStore'

type StatementTab = 'income' | 'cashflow' | 'balance'

const TABS: { key: StatementTab; label: string }[] = [
  { key: 'income', label: 'Estado de resultados' },
  { key: 'cashflow', label: 'Flujo de caja' },
  { key: 'balance', label: 'Balance general' },
]

const currentPeriod = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/**
 * EstadosFinancierosPage
 * Estados financieros calculados a partir de ventas, gastos y cuentas de cobro.
 */
export const EstadosFinancierosPage = () => {
  const { user } = useAuthStore()
  const canWrite = user?.role === 'admin' || user?.role === 'manager'

  const [tab, setTab] = useState<StatementTab>('income')
  const [from, setFrom] = useState(`${new Date().getFullYear()}-01`) // YTD
  const [to, setTo] = useState(currentPeriod())

  const [incomeStatement, setIncomeStatement] =
    useState<IncomeStatement | null>(null)
  const [cashFlow, setCashFlow] = useState<CashFlow | null>(null)
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatement = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      if (tab === 'income') {
        setIncomeStatement(await financesApi.getIncomeStatement(from, to))
      } else if (tab === 'cashflow') {
        setCashFlow(await financesApi.getCashFlow(from, to))
      } else {
        setBalanceSheet(await financesApi.getBalanceSheet())
      }
    } catch (err) {
      console.error('Error cargando estado financiero:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Error al cargar el estado financiero'
      )
    } finally {
      setLoading(false)
    }
  }, [tab, from, to])

  useEffect(() => {
    fetchStatement()
  }, [fetchStatement])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Estados financieros</h1>

      {/* Pestañas */}
      <div className="flex gap-2 border-b border-border">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab !== 'balance' && (
        <MonthRangePicker
          from={from}
          to={to}
          onChange={(f, t) => {
            setFrom(f)
            setTo(t)
          }}
        />
      )}

      {loading && (
        <Card className="flex items-center justify-center p-12">
          <LoadingSpinner />
        </Card>
      )}

      {!loading && error && (
        <Card className="p-6">
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
          <Button variant="outline" className="mt-4" onClick={fetchStatement}>
            Reintentar
          </Button>
        </Card>
      )}

      {!loading && !error && tab === 'income' && incomeStatement && (
        <IncomeStatementTable statement={incomeStatement} />
      )}

      {!loading && !error && tab === 'cashflow' && cashFlow && (
        <CashFlowTable cashFlow={cashFlow} />
      )}

      {!loading && !error && tab === 'balance' && balanceSheet && (
        <BalanceSheetView
          sheet={balanceSheet}
          canEdit={canWrite}
          onRefresh={fetchStatement}
        />
      )}
    </div>
  )
}
