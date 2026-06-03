import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { SalesSummaryCards } from '@/components/SalesSummaryCards'
import { SalesList } from '@/components/SalesList'
import { ManualSaleModal } from '@/components/ManualSaleModal'
import { salesService, type SaleFilters } from '@/services/salesService'
import { shopifyService } from '@/services/shopifyService'
import type { Sale, SalesSummary, SaleSource } from '@/types/sale'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from '@/utils/toast'
import { RefreshCw, Plus } from 'lucide-react'

type SourceFilter = SaleSource | 'all'

const SOURCE_TABS: { value: SourceFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'store', label: 'Tiendas' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

/**
 * VentasPage
 * Unified sales dashboard showing revenue across all channels.
 * Supports filtering by channel and date range for P&G use.
 */
export const VentasPage = () => {
  const { user } = useAuthStore()
  const canWrite = user?.role === 'admin' || user?.role === 'manager'

  const [activeTab, setActiveTab] = useState<SourceFilter>('all')
  const [sales, setSales] = useState<Sale[]>([])
  const [summary, setSummary] = useState<SalesSummary | null>(null)
  const [loadingSales, setLoadingSales] = useState(false)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [salesError, setSalesError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [showSaleModal, setShowSaleModal] = useState(false)

  const fetchSales = useCallback(async (signal?: AbortSignal) => {
    setLoadingSales(true)
    setSalesError(null)
    const filters: SaleFilters = {}
    if (activeTab !== 'all') filters.source = activeTab
    try {
      const data = await salesService.listSales(filters, signal)
      setSales(data ?? [])
    } catch (err) {
      if (signal?.aborted) return
      setSalesError(err instanceof Error ? err.message : 'Error al cargar las ventas')
    } finally {
      if (!signal?.aborted) setLoadingSales(false)
    }
  }, [activeTab])

  const fetchSummary = useCallback(async (signal?: AbortSignal) => {
    setLoadingSummary(true)
    try {
      const data = await salesService.getSalesSummary(undefined, undefined, signal)
      setSummary(data)
    } catch {
      // Summary is non-critical; silently ignore
    } finally {
      if (!signal?.aborted) setLoadingSummary(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchSales(controller.signal)
    return () => controller.abort()
  }, [fetchSales])

  useEffect(() => {
    const controller = new AbortController()
    fetchSummary(controller.signal)
    return () => controller.abort()
  }, [fetchSummary])

  const handleShopifySync = async () => {
    setSyncing(true)
    try {
      const result = await shopifyService.triggerSync()
      toast.success(
        `Sincronización completada: ${result.synced} órdenes importadas, ${result.skipped} omitidas`,
      )
      fetchSales()
      fetchSummary()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al sincronizar con Shopify')
    } finally {
      setSyncing(false)
    }
  }

  const handleSaleCreated = () => {
    fetchSales()
    fetchSummary()
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Ventas</h1>
        <div className="flex gap-2">
          {canWrite && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShopifySync}
                disabled={syncing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Sincronizando...' : 'Sincronizar Shopify'}
              </Button>
              <Button size="sm" onClick={() => setShowSaleModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva venta
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <SalesSummaryCards summary={summary} loading={loadingSummary} />

      {/* Channel filter tabs */}
      <div className="flex gap-1 border-b">
        {SOURCE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sales table */}
      <SalesList
        sales={sales}
        loading={loadingSales}
        error={salesError}
        onRetry={() => fetchSales()}
      />

      {/* Manual sale modal */}
      <ManualSaleModal
        open={showSaleModal}
        onClose={() => setShowSaleModal(false)}
        onSuccess={handleSaleCreated}
      />
    </div>
  )
}
