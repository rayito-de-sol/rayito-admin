import type { ProductStatus } from '@/types/product'

interface StatusBadgeProps {
  status: ProductStatus
}

/**
 * StatusBadge
 * Display product status with appropriate colors
 */
export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = {
    draft: {
      label: 'Borrador',
      className: 'bg-gray-100 text-gray-600',
    },
    active: {
      label: 'Activo',
      className: 'bg-green-100 text-green-800',
    },
    inactive: {
      label: 'Inactivo',
      className: 'bg-red-100 text-red-800',
    },
  }

  const config = statusConfig[status]

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
