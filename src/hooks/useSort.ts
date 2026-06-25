import { useMemo, useState } from 'react'

export type SortDirection = 'asc' | 'desc'

type SortValue = string | number | null | undefined

/**
 * useSort
 * Generic client-side table sorting. Provide a map of column key -> value
 * getter; clicking a column toggles asc/desc. Nullish values sort last.
 */
export function useSort<T>(
  items: T[],
  getters: Record<string, (item: T) => SortValue>
) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDirection>('asc')

  const toggleSort = (key: string) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey || !getters[sortKey]) return items
    const getter = getters[sortKey]
    const dir = sortDir === 'asc' ? 1 : -1

    return [...items].sort((a, b) => {
      const av = getter(a)
      const bv = getter(b)

      // Nullish always sorts last regardless of direction
      const aNull = av === null || av === undefined || av === ''
      const bNull = bv === null || bv === undefined || bv === ''
      if (aNull && bNull) return 0
      if (aNull) return 1
      if (bNull) return -1

      if (typeof av === 'number' && typeof bv === 'number') {
        return (av - bv) * dir
      }
      return String(av).localeCompare(String(bv), 'es', { numeric: true }) * dir
    })
  }, [items, sortKey, sortDir, getters])

  return { sorted, sortKey, sortDir, toggleSort }
}
