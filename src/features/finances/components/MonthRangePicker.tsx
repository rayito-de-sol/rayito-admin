import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const FIRST_YEAR = 2023

interface MonthRangePickerProps {
  from: string // "YYYY-MM"
  to: string
  onChange: (from: string, to: string) => void
}

const splitPeriod = (period: string) => {
  const [year, month] = period.split('-')
  return { year: year ?? '', month: month ?? '' }
}

/**
 * MonthRangePicker
 * Selector de rango de meses (desde/hasta) con selects de mes y año.
 */
export const MonthRangePicker = ({
  from,
  to,
  onChange,
}: MonthRangePickerProps) => {
  const currentYear = new Date().getFullYear()
  const years: string[] = []
  for (let y = FIRST_YEAR; y <= currentYear; y++) years.push(String(y))

  const fromParts = splitPeriod(from)
  const toParts = splitPeriod(to)

  const update = (
    which: 'from' | 'to',
    part: 'year' | 'month',
    value: string
  ) => {
    const parts = which === 'from' ? { ...fromParts } : { ...toParts }
    parts[part] = value
    const period = `${parts.year}-${parts.month}`
    if (which === 'from') onChange(period, to)
    else onChange(from, period)
  }

  const monthSelect = (which: 'from' | 'to', value: string) => (
    <Select value={value} onValueChange={(v) => update(which, 'month', v)}>
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {MONTH_NAMES.map((name, i) => {
          const mm = String(i + 1).padStart(2, '0')
          return (
            <SelectItem key={mm} value={mm}>
              {name}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )

  const yearSelect = (which: 'from' | 'to', value: string) => (
    <Select value={value} onValueChange={(v) => update(which, 'year', v)}>
      <SelectTrigger className="w-24">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {years.map((y) => (
          <SelectItem key={y} value={y}>
            {y}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <Label className="mb-2">Desde</Label>
        <div className="flex gap-2">
          {monthSelect('from', fromParts.month)}
          {yearSelect('from', fromParts.year)}
        </div>
      </div>
      <div>
        <Label className="mb-2">Hasta</Label>
        <div className="flex gap-2">
          {monthSelect('to', toParts.month)}
          {yearSelect('to', toParts.year)}
        </div>
      </div>
    </div>
  )
}
