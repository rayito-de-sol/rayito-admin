/**
 * Format amount as Colombian pesos
 * @param amount Amount in COP
 * @returns Formatted currency string (e.g., "$50.000 COP")
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format date in Spanish locale
 * @param dateString ISO date string
 * @returns Formatted date string (e.g., "25/03/2025 14:30")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
