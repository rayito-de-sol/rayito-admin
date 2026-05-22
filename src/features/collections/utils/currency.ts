/**
 * Formats a number as Colombian Peso currency
 * @param amount - The numeric amount to format
 * @returns Formatted currency string (e.g., "$180,000 COP")
 */
export function formatColombiaCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  return `$${formatted} COP`
}
