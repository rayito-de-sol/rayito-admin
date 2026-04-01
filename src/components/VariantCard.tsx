import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { ImageGalleryModal } from './ImageGalleryModal'
import type { Variant } from '@/types/variant'
import { formatCurrency } from '@/utils/currency'

/**
 * Props for VariantCard component
 */
interface VariantCardProps {
  variant: Variant
  canEdit: boolean
  onUpdateStock: (variant: Variant) => void
  onUpdateCost: (variant: Variant) => void
  onViewCostHistory: (variant: Variant) => void
}

/**
 * VariantCard
 * Display variant summary with color, size, SKU, stock, cost, and primary image
 */
export const VariantCard = ({
  variant,
  canEdit,
  onUpdateStock,
  onUpdateCost,
  onViewCostHistory,
}: VariantCardProps) => {
  const [showImageGallery, setShowImageGallery] = useState(false)

  // Get primary image or first image
  const primaryImage =
    variant.images.find((img) => img.is_primary) || variant.images[0]

  // Placeholder image for variants without images
  const placeholderImage =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gaW1hZ2VuPC90ZXh0Pjwvc3ZnPg=='

  return (
    <>
      <Card className="p-4">
        <div className="flex gap-4">
          {/* Image */}
          <div
            className="h-24 w-24 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border"
            onClick={() =>
              variant.images.length > 0 && setShowImageGallery(true)
            }
          >
            <img
              src={primaryImage?.url || placeholderImage}
              alt={primaryImage?.alt || 'Variante'}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = placeholderImage
              }}
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="mb-2">
              <h4 className="font-semibold">{variant.color}</h4>
              <p className="text-sm text-muted-foreground">
                {variant.size?.label || 'Sin talla'}
              </p>
              <p className="text-xs text-muted-foreground">
                SKU: {variant.sku}
              </p>
            </div>

            <div className="mb-2 flex gap-4 text-sm">
              <div>
                <span className="font-medium">Stock:</span> {variant.stock}
              </div>
              {variant.current_cost !== undefined && (
                <div>
                  <span className="font-medium">Costo:</span>{' '}
                  {formatCurrency(variant.current_cost)}
                </div>
              )}
            </div>

            {canEdit && (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStock(variant)}
                >
                  Actualizar Stock
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateCost(variant)}
                >
                  Actualizar Costo
                </Button>
                <Button
                  size="sm"
                  variant="link"
                  className="p-0"
                  onClick={() => onViewCostHistory(variant)}
                >
                  Ver historial
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={showImageGallery}
        onClose={() => setShowImageGallery(false)}
        images={variant.images}
      />
    </>
  )
}
