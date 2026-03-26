import { useState, useEffect } from 'react'
import { Store } from '@/types/store'
import { StoresList } from '@/components/StoresList'
import { StoresForm } from '@/components/StoresForm'
import { StoresDetail } from '@/components/StoresDetail'
import { storesService } from '@/services/stores'

type View = 'list' | 'create' | 'edit' | 'detail'

/**
 * StoresPage component
 * Main page for managing third-party stores
 */
export const StoresPage = () => {
  const [view, setView] = useState<View>('list')
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch all stores
   */
  const fetchStores = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await storesService.listStores()
      setStores(data)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error al cargar las tiendas')
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch stores on component mount
   */
  useEffect(() => {
    fetchStores()
  }, [])

  /**
   * Handle store row click - show detail view
   */
  const handleStoreClick = (storeId: string) => {
    setSelectedStoreId(storeId)
    setView('detail')
  }

  /**
   * Handle create button click - show create form
   */
  const handleCreateClick = () => {
    setSelectedStoreId(null)
    setSelectedStore(null)
    setView('create')
  }

  /**
   * Handle edit button click - show edit form
   */
  const handleEditClick = async () => {
    if (!selectedStoreId) return

    try {
      // Fetch fresh store data for editing
      const store = await storesService.getStore(selectedStoreId)
      setSelectedStore(store)
      setView('edit')
    } catch (err) {
      console.error('Error loading store for edit:', err)
    }
  }

  /**
   * Handle successful form submission - refresh list and return to list view
   */
  const handleFormSuccess = async () => {
    await fetchStores()
    setView('list')
    setSelectedStoreId(null)
    setSelectedStore(null)
  }

  /**
   * Handle form cancel - return to appropriate previous view
   */
  const handleFormCancel = () => {
    if (view === 'edit' && selectedStoreId) {
      // Return to detail view if editing
      setView('detail')
    } else {
      // Return to list view if creating
      setView('list')
    }
    setSelectedStore(null)
  }

  /**
   * Handle back button click - return to list view
   */
  const handleBackClick = () => {
    setView('list')
    setSelectedStoreId(null)
    setSelectedStore(null)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tiendas</h1>
        <p className="mt-2 text-muted-foreground">
          Gestiona las tiendas de terceros
        </p>
      </div>

      {/* List View */}
      {view === 'list' && (
        <StoresList
          stores={stores}
          loading={loading}
          error={error}
          onStoreClick={handleStoreClick}
          onCreateClick={handleCreateClick}
          onRetry={fetchStores}
        />
      )}

      {/* Create View */}
      {view === 'create' && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Nueva Tienda</h2>
          </div>
          <StoresForm
            mode="create"
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {/* Edit View */}
      {view === 'edit' && selectedStore && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Editar Tienda</h2>
          </div>
          <StoresForm
            mode="edit"
            initialData={selectedStore}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {/* Detail View */}
      {view === 'detail' && selectedStoreId && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Detalle de Tienda</h2>
          </div>
          <StoresDetail
            storeId={selectedStoreId}
            onEdit={handleEditClick}
            onBack={handleBackClick}
          />
        </div>
      )}
    </div>
  )
}
