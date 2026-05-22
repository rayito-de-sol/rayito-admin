import { useEffect } from 'react'
import { collectionsApi } from '../api/collectionsApi'
import { useCollectionsStore } from '../store/collectionsStore'
import type { CollectionFilters } from '../types/collection.types'

/**
 * Hook to fetch and manage collections for a store
 */
export const useCollections = (storeId: string, filters?: CollectionFilters) => {
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
        store_id: storeId,
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
    if (storeId) {
      fetchCollections()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, filters?.state])

  return {
    collections,
    isLoading,
    error,
    refetch: fetchCollections,
  }
}
