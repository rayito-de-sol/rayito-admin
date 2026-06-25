import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import type { SortDirection } from '@/hooks/useSort'

interface RawSortableThProps {
  label: string
  sortKey: string
  activeKey: string | null
  direction: SortDirection
  onSort: (key: string) => void
  align?: 'left' | 'right'
}

/**
 * RawSortableTh
 * Clickable sortable header for plain <table> markup (not the shared Table UI).
 */
export const RawSortableTh = ({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  align = 'left',
}: RawSortableThProps) => {
  const isActive = activeKey === sortKey

  return (
    <th
      className={`px-4 py-3 font-medium ${align === 'right' ? 'text-right' : 'text-left'}`}
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
    </th>
  )
}
