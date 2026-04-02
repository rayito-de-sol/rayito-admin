import { useState, useEffect } from 'react'
import { PackagesList } from '@/components/PackagesList'
import { PackagesDetail } from '@/components/PackagesDetail'
import { PackageCreateForm } from '@/components/PackageCreateForm'
import { PackageEditModal } from '@/components/PackageEditModal'
import type { Package } from '@/types/package'
import { packageService } from '@/services/packageService'
import { useAuth } from '@/hooks/useAuth'

type View = 'list' | 'create' | 'detail' | 'edit'

/**
 * PackagesPage
 * Main page for managing reusable packages with table view and detail pages
 */
export const PackagesPage = () => {
  const { user } = useAuth()
  const canEdit = user?.role === 'admin' || user?.role === 'manager'

  const [view, setView] = useState<View>('list')
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null
  )
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch packages
   */
  const fetchPackages = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await packageService.listPackages()
      setPackages(data || [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar los empaques'
      )
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetch packages on mount
   */
  useEffect(() => {
    fetchPackages()
  }, [])

  /**
   * Handle package row click - show detail view
   */
  const handlePackageClick = (packageId: string) => {
    setSelectedPackageId(packageId)
    setView('detail')
  }

  /**
   * Handle create button click - show create form
   */
  const handleCreateClick = () => {
    setView('create')
  }

  /**
   * Handle create success
   */
  const handleCreateSuccess = async () => {
    await fetchPackages()
    setView('list')
  }

  /**
   * Handle edit button click - show edit modal
   */
  const handleEditClick = async () => {
    if (!selectedPackageId) return

    try {
      // Fetch fresh package data for editing
      const pkg = await packageService.getPackage(selectedPackageId)
      setSelectedPackage(pkg)
      setView('edit')
    } catch (err) {
      console.error('Error loading package for edit:', err)
    }
  }

  /**
   * Handle edit success
   */
  const handleEditSuccess = async () => {
    await fetchPackages()
    setView('detail')
    setSelectedPackage(null)
  }

  /**
   * Handle form cancel - return to appropriate previous view
   */
  const handleFormCancel = () => {
    if (view === 'edit' && selectedPackageId) {
      // Return to detail view if editing
      setView('detail')
    } else {
      // Return to list view if creating
      setView('list')
    }
    setSelectedPackage(null)
  }

  /**
   * Handle back button click - return to list view
   */
  const handleBackClick = () => {
    setView('list')
    setSelectedPackageId(null)
    setSelectedPackage(null)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Empaques</h1>
        <p className="mt-2 text-muted-foreground">
          Gestiona los empaques reutilizables
        </p>
      </div>

      {/* List View */}
      {view === 'list' && (
        <PackagesList
          packages={packages}
          loading={loading}
          error={error}
          onPackageClick={handlePackageClick}
          onCreateClick={handleCreateClick}
          onRetry={fetchPackages}
          canEdit={canEdit}
        />
      )}

      {/* Create View */}
      {view === 'create' && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Nuevo Empaque</h2>
          </div>
          <PackageCreateForm
            onSuccess={handleCreateSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {/* Detail View */}
      {view === 'detail' && selectedPackageId && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Detalle del Empaque</h2>
          </div>
          <PackagesDetail
            packageId={selectedPackageId}
            onBack={handleBackClick}
            onEdit={handleEditClick}
          />
        </div>
      )}

      {/* Edit Modal */}
      {view === 'edit' && selectedPackage && (
        <PackageEditModal
          isOpen={view === 'edit'}
          onClose={handleFormCancel}
          onSuccess={handleEditSuccess}
          package={selectedPackage}
        />
      )}
    </div>
  )
}
