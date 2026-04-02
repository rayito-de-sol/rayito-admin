/**
 * Date formatting utilities
 * Provides consistent date display throughout the application
 */

/**
 * Check if a date value is valid
 */
const isValidDate = (date: Date | string | null | undefined): boolean => {
  if (!date) return false
  const d = typeof date === 'string' ? new Date(date) : date
  return d instanceof Date && !isNaN(d.getTime())
}

/**
 * Format date as DD/MM/YYYY
 * Returns fallback text if date is invalid
 */
export const formatDate = (
  date: Date | string | null | undefined,
  fallback = 'Fecha no disponible'
): string => {
  if (!isValidDate(date)) return fallback
  const d = typeof date === 'string' ? new Date(date) : (date as Date)
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Format date with time as DD/MM/YYYY HH:MM
 * Returns fallback text if date is invalid
 */
export const formatDateTime = (
  date: Date | string | null | undefined,
  fallback = 'Fecha no disponible'
): string => {
  if (!isValidDate(date)) return fallback
  const d = typeof date === 'string' ? new Date(date) : (date as Date)
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format date as relative time (e.g., "hace 2 días")
 * Returns fallback text if date is invalid
 */
export const formatRelativeTime = (
  date: Date | string | null | undefined,
  fallback = 'Fecha no disponible'
): string => {
  if (!isValidDate(date)) return fallback
  const d = typeof date === 'string' ? new Date(date) : (date as Date)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'hace unos segundos'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `hace ${diffInMonths} ${diffInMonths === 1 ? 'mes' : 'meses'}`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `hace ${diffInYears} ${diffInYears === 1 ? 'año' : 'años'}`
}
