import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'

export interface SearchableSelectOption {
  value: string
  label: string
  /** Segunda línea: identificación, teléfono, color... */
  description?: string
  /** Etiqueta corta a la derecha, por ejemplo el tipo de cliente */
  badge?: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  /** Muestra un pie "+ …" para crear un registro nuevo sin salir del formulario */
  onCreateNew?: () => void
  createNewLabel?: string
  className?: string
}

/**
 * SearchableSelect
 * Desplegable con búsqueda. El Select de Radix no filtra, y las listas de
 * variantes y clientes son demasiado largas para recorrerlas a mano.
 *
 * Se renderiza dentro de formularios, así que todos los botones son type="button"
 * para no enviar el formulario al abrir o elegir.
 */
export const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  emptyText = 'Sin resultados',
  disabled = false,
  onCreateNew,
  createNewLabel = 'Nuevo',
  className,
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = options.find((option) => option.value === value)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return options
    return options.filter((option) =>
      [option.label, option.description, option.badge]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    )
  }, [options, search])

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setSearch('')
  }

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    handleOpenChange(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            !selected && 'text-muted-foreground',
            className
          )}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <div className="border-b border-border p-2">
          <Input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>

        <div className="max-h-64 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="p-3 text-center text-sm text-muted-foreground">
              {emptyText}
            </p>
          )}
          {filtered.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={cn(
                'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-secondary',
                option.value === value && 'bg-secondary'
              )}
            >
              <span className="min-w-0">
                <span className="block truncate">{option.label}</span>
                {option.description && (
                  <span className="block truncate text-xs text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                {option.badge && <Badge variant="outline">{option.badge}</Badge>}
                {option.value === value && <Check className="h-4 w-4" />}
              </span>
            </button>
          ))}
        </div>

        {onCreateNew && (
          <div className="border-t border-border p-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                handleOpenChange(false)
                onCreateNew()
              }}
            >
              <Plus className="mr-1 h-4 w-4" />
              {createNewLabel}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
