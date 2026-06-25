import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { TableHead } from '@/components/ui/table'
import type { SortDirection } from '@/hooks/useSort'

interface SortableHeadProps {
  label: string
  sortKey: string
  activeKey: string | null
  direction: SortDirection
  onSort: (key: string) => void
  align?: 'left' | 'right'
}

/**
 * SortableHead
 * Clickable table header that shows the current sort state.
 */
export const SortableHead = ({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  align = 'left',
}: SortableHeadProps) => {
  const isActive = activeKey === sortKey

  return (
    <TableHead
      className={align === 'right' ? 'text-right' : undefined}
      aria-sort={isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 select-none hover:text-foreground ${
          align === 'right' ? 'flex-row-reverse' : ''
        }`}
      >
        {label}
        {isActive ? (
          direction === 'asc' ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )
        ) : (
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
        )}
      </button>
    </TableHead>
  )
}
