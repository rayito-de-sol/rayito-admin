import { Package } from '@/types/package'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Plus } from 'lucide-react'
import { formatCurrency } from '@/utils/currency'

interface PackagesListProps {
  packages: Package[]
  loading: boolean
  error: string | null
  onPackageClick: (packageId: string) => void
  onCreateClick: () => void
  onRetry: () => void
  canEdit: boolean
}

/**
 * PackagesList component
 * Displays all packages in a table with loading, empty, and error states
 */
export const PackagesList = ({
  packages,
  loading,
  error,
  onPackageClick,
  onCreateClick,
  onRetry,
  canEdit,
}: PackagesListProps) => {
  // Loading state
  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="mb-4 text-destructive">{error}</p>
          <Button onClick={onRetry} variant="outline">
            Reintentar
          </Button>
        </div>
      </Card>
    )
  }

  // Empty state
  if (packages.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">
            No hay empaques registrados
          </p>
          {canEdit && (
            <Button onClick={onCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Empaque
            </Button>
          )}
        </div>
      </Card>
    )
  }

  // Table with packages
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canEdit && (
          <Button onClick={onCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Empaque
          </Button>
        )}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Costo Actual</TableHead>
              <TableHead className="text-right">Uso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow
                key={pkg.id}
                onClick={() => onPackageClick(pkg.id)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium">{pkg.name}</TableCell>
                <TableCell>
                  {pkg.description || (
                    <span className="text-muted-foreground">
                      Sin descripción
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {pkg.current_cost !== undefined
                    ? formatCurrency(pkg.current_cost)
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {pkg.usage_count || 0} producto
                  {(pkg.usage_count || 0) !== 1 ? 's' : ''}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
