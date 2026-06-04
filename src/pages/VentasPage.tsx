import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { SalesSummaryCards } from '@/components/SalesSummaryCards'
import { OrdersList } from '@/components/OrdersList'
import { ManualOrderModal } from '@/components/ManualOrderModal'
import { ordersService, type OrderFilters } from '@/services/ordersService'
import { shopifyService } from '@/services/shopifyService'
import type { Order, OrdersSummary, OrderSource } from '@/types/order'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from '@/utils/toast'
import { RefreshCw, Plus, Settings } from 'lucide-react'

type SourceFilter = OrderSource | 'all'

const SOURCE_TABS: { value: SourceFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'store', label: 'Tiendas' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

/**
 * VentasPage
 * Unified orders dashboard showing revenue across all channels.
 * Supports filtering by channel and date range for P&G use.
 */
export const VentasPage = () => {
  const { user } = useAuthStore()
  const canWrite = user?.role === 'admin' || user?.role === 'manager'

  const [activeTab, setActiveTab] = useState<SourceFilter>('all')
  const [orders, setOrders] = useState<Order[]>([])
  const [summary, setSummary] = useState<OrdersSummary | null>(null)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [settingUp, setSettingUp] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)

  const fetchOrders = useCallback(
    async (signal?: AbortSignal) => {
      setLoadingOrders(true)
      setOrdersError(null)
      const filters: OrderFilters = {}
      if (activeTab !== 'all') filters.source = activeTab
      try {
        const data = await ordersService.listOrders(filters, signal)
        setOrders(data ?? [])
      } catch (err) {
        if (signal?.aborted) return
        setOrdersError(err instanceof Error ? err.message : 'Error al cargar los pedidos')
      } finally {
        if (!signal?.aborted) setLoadingOrders(false)
      }
    },
    [activeTab],
  )

  const fetchSummary = useCallback(async (signal?: AbortSignal) => {
    setLoadingSummary(true)
    try {
      const data = await ordersService.getOrdersSummary(undefined, undefined, signal)
      setSummary(data)
    } catch {
      // Summary is non-critical; silently ignore
    } finally {
      if (!signal?.aborted) setLoadingSummary(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchOrders(controller.signal)
    return () => controller.abort()
  }, [fetchOrders])

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
      fetchOrders()
      fetchSummary()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al sincronizar con Shopify')
    } finally {
      setSyncing(false)
    }
  }

  const handleShopifySetup = async () => {
    setSettingUp(true)
    try {
      const result = await shopifyService.setup()
      const registered = result.registered ?? []
      const existed = result.already_existed ?? []
      if (registered.length > 0) {
        toast.success(`Webhooks registrados: ${registered.join(', ')}`)
      } else {
        toast.success(
          existed.length > 0
            ? `Webhooks ya configurados: ${existed.join(', ')}`
            : 'Configuración completada',
        )
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al configurar webhooks')
    } finally {
      setSettingUp(false)
    }
  }

  const handleOrderCreated = () => {
    fetchOrders()
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
                onClick={handleShopifySetup}
                disabled={settingUp}
              >
                <Settings className={`mr-2 h-4 w-4 ${settingUp ? 'animate-spin' : ''}`} />
                {settingUp ? 'Configurando...' : 'Configurar webhooks'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShopifySync}
                disabled={syncing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Sincronizando...' : 'Sincronizar Shopify'}
              </Button>
              <Button size="sm" onClick={() => setShowOrderModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo pedido
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

      {/* Orders table */}
      <OrdersList
        orders={orders}
        loading={loadingOrders}
        error={ordersError}
        onRetry={() => fetchOrders()}
      />

      {/* Manual order modal */}
      <ManualOrderModal
        open={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        onSuccess={handleOrderCreated}
      />
    </div>
  )
}
