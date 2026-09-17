import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { CustomersList } from '@/components/CustomersList'
import { CustomerDetail } from '@/components/CustomerDetail'
import { CustomerFormModal } from '@/components/CustomerFormModal'
import { CustomersCSVImport } from '@/components/CustomersCSVImport'
import { customersService } from '@/services/customers'
import type { Customer, CustomerType } from '@/types/customer'
import { Plus, Upload } from 'lucide-react'

type View = 'list' | 'detail' | 'import'

const TABS: { key: CustomerType; label: string }[] = [
  { key: 'person', label: 'Personas' },
  { key: 'store', label: 'Tiendas' },
]

/**
 * CustomersPage
 * Clientes del taller: personas (venta al detal) y tiendas (venta al por mayor).
 * Las pestañas filtran la misma lista en memoria; son pocos registros.
 */
export const CustomersPage = () => {
  const [view, setView] = useState<View>('list')
  const [tab, setTab] = useState<CustomerType>('person')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  // Forzar el remontaje de la ficha para que recargue tras editar
  const [detailKey, setDetailKey] = useState(0)

  const fetchCustomers = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      setError(null)
      const data = await customersService.listCustomers(undefined, signal)
      setCustomers(data || [])
    } catch (err) {
      if (signal?.aborted) return
      setError(err instanceof Error ? err.message : 'Error al cargar los clientes')
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchCustomers(controller.signal)
    return () => controller.abort()
  }, [fetchCustomers])

  const handleCustomerClick = (customerId: string) => {
    setSelectedCustomerId(customerId)
    setView('detail')
  }

  const handleCreateClick = () => {
    setEditingCustomer(null)
    setFormOpen(true)
  }

  const handleEditClick = async () => {
    if (!selectedCustomerId) return
    try {
      // Releer para editar sobre los datos más recientes
      const customer = await customersService.getCustomer(selectedCustomerId)
      setEditingCustomer(customer)
      setFormOpen(true)
    } catch (err) {
      console.error('Error cargando el cliente para editar:', err)
    }
  }

  const handleFormSuccess = () => {
    fetchCustomers()
    setDetailKey((key) => key + 1)
  }

  const handleBackClick = () => {
    setView('list')
    setSelectedCustomerId(null)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <p className="mt-2 text-muted-foreground">
          Gestiona las personas y las tiendas a las que vendes
        </p>
      </div>

      {view === 'list' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-3">
            {tab === 'store' && (
              <Button variant="outline" onClick={() => setView('import')}>
                <Upload className="mr-2 h-4 w-4" />
                Importar CSV
              </Button>
            )}
            <Button onClick={handleCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              {tab === 'person' ? 'Nueva persona' : 'Nueva tienda'}
            </Button>
          </div>

          <div className="flex gap-2 border-b border-border">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  tab === key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <CustomersList
            customers={customers.filter((customer) => customer.type === tab)}
            type={tab}
            loading={loading}
            error={error}
            onCustomerClick={handleCustomerClick}
            onRetry={fetchCustomers}
          />
        </div>
      )}

      {view === 'import' && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Importar Tiendas desde CSV</h2>
          </div>
          <CustomersCSVImport
            onSuccess={() => {
              fetchCustomers()
              setView('list')
            }}
            onCancel={() => setView('list')}
          />
        </div>
      )}

      {view === 'detail' && selectedCustomerId && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Detalle del Cliente</h2>
          </div>
          <CustomerDetail
            key={detailKey}
            customerId={selectedCustomerId}
            onEdit={handleEditClick}
            onBack={handleBackClick}
          />
        </div>
      )}

      <CustomerFormModal
        open={formOpen}
        customer={editingCustomer}
        defaultType={tab}
        onClose={() => {
          setFormOpen(false)
          setEditingCustomer(null)
        }}
        onSuccess={handleFormSuccess}
      />
    </div>
  )
}
