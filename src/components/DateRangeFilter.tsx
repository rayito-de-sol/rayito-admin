import { useId } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DateRangeFilterProps {
  /** YYYY-MM-DD, o '' sin límite */
  from: string
  /** YYYY-MM-DD, o '' sin límite */
  to: string
  onChange: (from: string, to: string) => void
}

/**
 * DateRangeFilter
 * Campos "Desde" y "Hasta" para filtrar por fecha, ambos extremos incluidos.
 * Cada campo impide elegir un rango invertido, y "Limpiar fechas" aparece
 * cuando hay alguna fecha. Devuelve un fragmento para alinearse con los demás
 * filtros de la fila en la que se ponga.
 */
export const DateRangeFilter = ({
  from,
  to,
  onChange,
}: DateRangeFilterProps) => {
  const id = useId()

  return (
    <>
      <div className="flex items-center gap-2">
        <Label htmlFor={`${id}-from`} className="text-muted-foreground">
          Desde
        </Label>
        <Input
          id={`${id}-from`}
          type="date"
          className="w-40"
          value={from}
          max={to || undefined}
          onChange={(e) => onChange(e.target.value, to)}
        />
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor={`${id}-to`} className="text-muted-foreground">
          Hasta
        </Label>
        <Input
          id={`${id}-to`}
          type="date"
          className="w-40"
          value={to}
          min={from || undefined}
          onChange={(e) => onChange(from, e.target.value)}
        />
      </div>
      {(from || to) && (
        <Button variant="ghost" size="sm" onClick={() => onChange('', '')}>
          Limpiar fechas
        </Button>
      )}
    </>
  )
}
