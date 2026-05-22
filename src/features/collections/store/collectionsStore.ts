import { create } from 'zustand'
import type { Collection } from '../types/collection.types'

interface CollectionsState {
  collections: Collection[]
  isLoading: boolean
  error: string | null
  setCollections: (collections: Collection[]) => void
  addCollection: (collection: Collection) => void
  updateCollection: (id: string, updates: Partial<Collection>) => void
  removeCollection: (id: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useCollectionsStore = create<CollectionsState>((set) => ({
  collections: [],
  isLoading: false,
  error: null,

  setCollections: (collections) => set({ collections }),

  addCollection: (collection) =>
    set((state) => ({
      collections: [collection, ...state.collections],
    })),

  updateCollection: (id, updates) =>
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  removeCollection: (id) =>
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      collections: [],
      isLoading: false,
      error: null,
    }),
}))
