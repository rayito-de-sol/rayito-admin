import { useState } from 'react'
import { collectionsApi } from '../api/collectionsApi'
import { useCollectionsStore } from '../store/collectionsStore'
import type { UpdateCollectionStateRequest } from '../types/collection.types'

/**
 * Hook to update collection state (finalize, mark as paid, cancel)
 */
export const useUpdateCollectionState = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { updateCollection } = useCollectionsStore()

  const updateState = async (
    id: string,
    data: UpdateCollectionStateRequest
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      const collection = await collectionsApi.updateState(id, data)
      updateCollection(id, collection)

      return collection
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error al actualizar estado de cuenta de cobro'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const finalize = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const collection = await collectionsApi.finalize(id)
      updateCollection(id, collection)

      return collection
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error al finalizar cuenta de cobro'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    updateState,
    finalize,
    isLoading,
    error,
  }
}
