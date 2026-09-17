import { useEffect } from 'react'
import { collectionsApi } from '../api/collectionsApi'
import { useCollectionsStore } from '../store/collectionsStore'
import type { CollectionFilters } from '../types/collection.types'

/**
 * Carga las cuentas de cobro de un cliente tipo tienda
 */
export const useCollections = (customerId: string, filters?: CollectionFilters) => {
  const {
    collections,
    isLoading,
    error,
    setCollections,
    setLoading,
    setError,
  } = useCollectionsStore()

  const fetchCollections = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await collectionsApi.list({
        ...filters,
        customer_id: customerId,
      })

      setCollections(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar cuentas de cobro'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (customerId) {
      fetchCollections()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, filters?.state])

  return {
    collections,
    isLoading,
    error,
    refetch: fetchCollections,
  }
}
