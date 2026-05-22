import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { variantService } from '@/services/variantService'
import type { Variant } from '@/types/variant'
import { formatColombiaCurrency } from '../utils/currency'
import { Search } from 'lucide-react'

interface ProductSelectorProps {
  onSelect: (variant: Variant) => void
  selectedVariantIds?: string[]
  disabled?: boolean
}

export const ProductSelector = ({
  onSelect,
  selectedVariantIds = [],
  disabled = false,
}: ProductSelectorProps) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [variants, setVariants] = useState<Variant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        setIsLoading(true)
        const data = await variantService.listVariants()
        setVariants(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Error al cargar variantes de productos'
        )
      } finally {
        setIsLoading(false)
      }
    }

    if (open) {
      fetchVariants()
    }
  }, [open])

  const filteredVariants = variants.filter((variant) => {
    // Filter out already selected variants
    if (selectedVariantIds.includes(variant.id)) {
      return false
    }

    // Search filter
    if (!search) return true

    const searchLower = search.toLowerCase()
    const productName = variant.product_name?.toLowerCase() || ''
    const color = variant.color.toLowerCase()
    const sku = variant.sku.toLowerCase()
    const sizeName = variant.size?.label.toLowerCase() || ''

    return (
      productName.includes(searchLower) ||
      color.includes(searchLower) ||
      sku.includes(searchLower) ||
      sizeName.includes(searchLower)
    )
  })

  const handleSelect = (variant: Variant) => {
    onSelect(variant)
    setOpen(false)
    setSearch('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button variant="outline" disabled={disabled} className="w-full">
          <Search className="mr-2 h-4 w-4" />
          Buscar producto
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="flex flex-col">
          <div className="border-b p-3">
            <Input
              placeholder="Buscar por nombre, color, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {isLoading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Cargando productos...
              </div>
            )}

            {error && (
              <div className="p-4 text-center text-sm text-destructive">
                {error}
              </div>
            )}

            {!isLoading && !error && filteredVariants.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {search
                  ? 'No se encontraron productos'
                  : 'No hay productos disponibles'}
              </div>
            )}

            {!isLoading &&
              !error &&
              filteredVariants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => handleSelect(variant)}
                  className="flex w-full items-center justify-between border-b px-4 py-3 text-left hover:bg-secondary"
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {variant.product_name} - {variant.color}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {variant.size?.label && `${variant.size.label} • `}
                      SKU: {variant.sku}
                    </div>
                  </div>
                  <div className="ml-4 text-sm text-muted-foreground">
                    {variant.current_cost !== undefined &&
                      formatColombiaCurrency(variant.current_cost)}
                  </div>
                </button>
              ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
