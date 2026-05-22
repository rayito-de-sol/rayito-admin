import { Badge } from '@/components/ui/badge'
import type { CollectionState } from '../types/collection.types'

interface CollectionStateBadgeProps {
  state: CollectionState
}

const stateConfig: Record<
  CollectionState,
  { label: string; className: string }
> = {
  draft: {
    label: 'Borrador',
    className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  },
  active: {
    label: 'Activo',
    className: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
  paid: {
    label: 'Pagado',
    className: 'bg-green-500 hover:bg-green-600 text-white',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-red-500 hover:bg-red-600 text-white',
  },
}

export const CollectionStateBadge = ({ state }: CollectionStateBadgeProps) => {
  const config = stateConfig[state]

  return <Badge className={config.className}>{config.label}</Badge>
}
