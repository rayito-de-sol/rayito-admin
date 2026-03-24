import { useUIStore } from '@/stores/useUIStore'
import { LoadingSpinner } from './LoadingSpinner'

/**
 * GlobalLoading component
 * Displays full-screen loading overlay when global loading state is active
 */
export const GlobalLoading = () => {
  const { isLoading } = useUIStore()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}
