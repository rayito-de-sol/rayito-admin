import { useState } from 'react'

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]
export const DEFAULT_PAGE_SIZE = 20

/**
 * usePagination
 * Paginación en el cliente: el API devuelve la lista completa y aquí se corta
 * la página visible. Recibe la lista ya ordenada, para que el orden abarque
 * todas las páginas. Se usa junto con <TablePagination {...pagination} />.
 *
 * resetOn funciona como las dependencias de un efecto: cuando cambia alguno de
 * esos valores (filtros, pestaña, orden) se vuelve a la primera página. Recargar
 * la misma lista, por ejemplo tras editar una fila, conserva la página.
 */
export function usePagination<T>(items: T[], resetOn: unknown[] = []) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  // Se reinicia durante el render y no en un efecto, así no alcanza a pintarse
  // la página anterior con los datos nuevos
  const resetKey = JSON.stringify(resetOn)
  const [lastResetKey, setLastResetKey] = useState(resetKey)
  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey)
    setPage(1)
  }

  // Si la lista se encoge (por ejemplo, al eliminar el último elemento de la
  // última página), se muestra la última página que queda
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize

  return {
    pageItems: items.slice(start, start + pageSize),
    pagination: {
      page: currentPage,
      pageSize,
      totalItems: items.length,
      onPageChange: setPage,
      onPageSizeChange: (size: number) => {
        setPageSize(size)
        setPage(1)
      },
    },
  }
}
