import { toast as sonnerToast } from 'sonner'

/**
 * Toast notification utilities
 * Wraps sonner with Spanish messages and consistent styling
 */

export const toast = {
  success: (message: string) => {
    sonnerToast.success(message)
  },

  error: (message: string) => {
    sonnerToast.error(message)
  },

  info: (message: string) => {
    sonnerToast.info(message)
  },

  warning: (message: string) => {
    sonnerToast.warning(message)
  },

  /**
   * Show error from caught exception
   */
  errorFromException: (err: unknown, fallback = 'Ocurrió un error') => {
    const message = err instanceof Error ? err.message : fallback
    sonnerToast.error(message)
  },
}
