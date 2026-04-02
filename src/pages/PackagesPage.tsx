import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PackageCard } from '@/components/PackageCard'
import { PackageCreateForm } from '@/components/PackageCreateForm'
import { PackageEditModal } from '@/components/PackageEditModal'
import { PackageUsageModal } from '@/components/PackageUsageModal'
import type { Package } from '@/types/package'
import { packageService } from '@/services/packageService'
import { useAuth } from '@/hooks/useAuth'

/**
 * PackagesPage
 * Main page for managing reusable packages
 */
export const PackagesPage = () => {
  const { user } = useAuth()
  const canEdit = user?.role === 'admin' || user?.role === 'manager'

  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [usagePackage, setUsagePackage] = useState<Package | null>(null)

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
   * Handle create success
   */
  const handleCreateSuccess = () => {
    setShowCreateForm(false)
    fetchPackages()
  }

  /**
   * Handle edit package
   */
  const handleEdit = (pkg: Package) => {
    setSelectedPackage(pkg)
  }

  /**
   * Handle edit success
   */
  const handleEditSuccess = () => {
    setSelectedPackage(null)
    fetchPackages()
  }

  /**
   * Handle view usage
   */
  const handleViewUsage = (pkg: Package) => {
    setUsagePackage(pkg)
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Empaques</h1>
            <p className="mt-2 text-muted-foreground">
              Gestiona los empaques reutilizables
            </p>
          </div>
          {canEdit && !showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)}>
              Crear Empaque
            </Button>
          )}
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-6 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Nuevo Empaque</h2>
          <PackageCreateForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando empaques...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          {error}
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPackages}
            className="ml-4"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && packages.length === 0 && !showCreateForm && (
        <div className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/50 p-12 text-center">
          <p className="text-lg text-muted-foreground">
            No hay empaques registrados
          </p>
          {canEdit && (
            <Button className="mt-4" onClick={() => setShowCreateForm(true)}>
              Crear Primer Empaque
            </Button>
          )}
        </div>
      )}

      {/* Packages list */}
      {!loading && !error && packages.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              canEdit={canEdit}
              onEdit={handleEdit}
              onViewUsage={handleViewUsage}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {selectedPackage && (
        <PackageEditModal
          isOpen={!!selectedPackage}
          onClose={() => setSelectedPackage(null)}
          onSuccess={handleEditSuccess}
          package={selectedPackage}
        />
      )}

      {/* Usage Modal */}
      {usagePackage && (
        <PackageUsageModal
          isOpen={!!usagePackage}
          onClose={() => setUsagePackage(null)}
          package={usagePackage}
        />
      )}
    </div>
  )
}
