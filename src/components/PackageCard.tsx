import { Card } from './ui/card'
import { Button } from './ui/button'
import type { Package } from '@/types/package'
import { formatCurrency } from '@/utils/currency'

/**
 * Props for PackageCard component
 */
interface PackageCardProps {
  package: Package
  canEdit: boolean
  onEdit: (pkg: Package) => void
  onViewUsage?: (pkg: Package) => void
}

/**
 * PackageCard
 * Display package summary with name, description, cost, and usage count
 */
export const PackageCard = ({
  package: pkg,
  canEdit,
  onEdit,
  onViewUsage,
}: PackageCardProps) => {
  const usageCount = pkg.usage_count || 0

  return (
    <Card className="p-4">
      <div className="mb-3">
        <h3 className="text-lg font-semibold">{pkg.name}</h3>
        {pkg.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {pkg.description}
          </p>
        )}
      </div>

      <div className="mb-3 flex items-center justify-between">
        {pkg.current_cost !== undefined && (
          <p className="text-lg font-semibold">
            {formatCurrency(pkg.current_cost)}
          </p>
        )}
        <div>
          {usageCount > 0 ? (
            <button
              onClick={() => onViewUsage?.(pkg)}
              className="text-sm text-primary hover:underline"
            >
              Usado en {usageCount} producto{usageCount !== 1 ? 's' : ''}
            </button>
          ) : (
            <p className="text-sm text-muted-foreground">No está en uso</p>
          )}
        </div>
      </div>

      {canEdit && (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => onEdit(pkg)}>
            Editar
          </Button>
        </div>
      )}
    </Card>
  )
}
