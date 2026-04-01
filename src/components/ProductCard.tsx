import { Card } from './ui/card'
import { StatusBadge } from './StatusBadge'
import type { Product } from '@/types/product'
import { formatCurrency } from '@/utils/currency'

interface ProductCardProps {
  product: Product
  onClick: (productId: string) => void
}

/**
 * ProductCard
 * Display product summary with name, category, type, status, and price
 */
export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const categoryLabels: Record<string, string> = {
    set: 'Set',
    turbante: 'Turbante',
    cintillo: 'Cintillo',
    pinza: 'Pinza',
    maximono: 'Maximono',
    mono: 'Mono',
    diadema: 'Diadema',
    otro: 'Otro',
  }

  const typeLabel = product.type === 'set' ? 'Set' : 'Simple'

  return (
    <Card
      className="cursor-pointer p-4 transition-shadow hover:shadow-md"
      onClick={() => onClick(product.id)}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-sm text-muted-foreground">
            {categoryLabels[product.category] || product.category}
          </p>
        </div>
        <StatusBadge status={product.status} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          {product.type === 'set' && (
            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {typeLabel}
            </span>
          )}
        </div>
        {product.current_price !== undefined && (
          <p className="text-lg font-semibold">
            {formatCurrency(product.current_price)}
          </p>
        )}
      </div>
    </Card>
  )
}
