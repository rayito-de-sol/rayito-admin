import { useState } from 'react'
import { collectionsApi } from '../api/collectionsApi'
import { useCollectionsStore } from '../store/collectionsStore'
import type { CreateCollectionRequest } from '../types/collection.types'

/**
 * Hook to create a new collection
 */
export const useCreateCollection = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addCollection } = useCollectionsStore()

  const createCollection = async (data: CreateCollectionRequest) => {
    try {
      setIsLoading(true)
      setError(null)

      const collection = await collectionsApi.create(data)
      addCollection(collection)

      return collection
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al crear cuenta de cobro'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createCollection,
    isLoading,
    error,
  }
}
