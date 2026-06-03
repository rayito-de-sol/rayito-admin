import type { SalesSummary } from '@/types/sale'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/utils/currency'
import { ShoppingBag, Store, ShoppingCart, MessageCircle } from 'lucide-react'

interface SalesSummaryCardsProps {
  summary: SalesSummary | null
  loading: boolean
}

/**
 * SalesSummaryCards component
 * Shows total revenue, order counts and per-channel breakdowns
 */
export const SalesSummaryCards = ({ summary, loading }: SalesSummaryCardsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse p-5">
            <div className="mb-2 h-4 w-24 rounded bg-gray-200" />
            <div className="h-7 w-32 rounded bg-gray-200" />
          </Card>
        ))}
      </div>
    )
  }

  const totalRevenue = summary?.total_revenue ?? 0
  const totalOrders = summary?.total_orders ?? 0
  const storeRevenue = summary?.by_source?.store?.revenue ?? 0
  const shopifyRevenue = summary?.by_source?.shopify?.revenue ?? 0
  const whatsappRevenue = summary?.by_source?.whatsapp?.revenue ?? 0

  const cards = [
    {
      label: 'Ingresos totales',
      value: formatCurrency(totalRevenue),
      sub: `${totalOrders} órdenes`,
      icon: <ShoppingBag className="h-5 w-5 text-[var(--color-primary)]" />,
    },
    {
      label: 'Tiendas',
      value: formatCurrency(storeRevenue),
      sub: `${summary?.by_source?.store?.orders ?? 0} órdenes`,
      icon: <Store className="h-5 w-5 text-[var(--color-primary)]" />,
    },
    {
      label: 'Shopify',
      value: formatCurrency(shopifyRevenue),
      sub: `${summary?.by_source?.shopify?.orders ?? 0} órdenes`,
      icon: <ShoppingCart className="h-5 w-5 text-[var(--color-primary)]" />,
    },
    {
      label: 'WhatsApp',
      value: formatCurrency(whatsappRevenue),
      sub: `${summary?.by_source?.whatsapp?.orders ?? 0} órdenes`,
      icon: <MessageCircle className="h-5 w-5 text-[var(--color-primary)]" />,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--color-muted-foreground)]">
              {card.label}
            </span>
            {card.icon}
          </div>
          <p className="text-xl font-bold text-[var(--color-foreground)]">{card.value}</p>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">{card.sub}</p>
        </Card>
      ))}
    </div>
  )
}
