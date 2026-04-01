import { useState } from 'react'
import { Button } from './ui/button'
import type { VariantImage } from '@/types/variant'

interface ImageGalleryModalProps {
  isOpen: boolean
  onClose: () => void
  images: VariantImage[]
  initialIndex?: number
}

/**
 * ImageGalleryModal
 * Modal for viewing variant images in full screen with navigation
 */
export const ImageGalleryModal = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}: ImageGalleryModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  if (!isOpen || images.length === 0) return null

  const currentImage = images[currentIndex]

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowLeft') {
      goToPrevious()
    } else if (e.key === 'ArrowRight') {
      goToNext()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative w-full max-w-4xl">
        {/* Close button */}
        <Button
          variant="ghost"
          className="absolute right-4 top-4 text-white hover:bg-white/20"
          onClick={onClose}
        >
          ✕
        </Button>

        {/* Image */}
        <div className="flex items-center justify-center">
          <img
            src={currentImage.url}
            alt={currentImage.alt || 'Imagen de variante'}
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4='
            }}
          />
        </div>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={goToPrevious}
            >
              ‹
            </Button>
            <Button
              variant="ghost"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={goToNext}
            >
              ›
            </Button>
          </>
        )}

        {/* Counter */}
        <div className="mt-4 text-center text-sm text-white">
          {currentIndex + 1} / {images.length}
          {currentImage.is_primary && (
            <span className="ml-2 rounded-full bg-white/20 px-2 py-1 text-xs">
              Principal
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
