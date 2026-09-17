import { useState, useEffect } from 'react'
import type { Customer } from '@/types/customer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { customersService } from '@/services/customers'
import { CUSTOMER_TYPE_LABELS } from '@/types/customer'
import { Badge } from '@/components/ui/badge'
import { CollectionsTable } from '@/features/collections/components/CollectionsTable'
import { Check, X } from 'lucide-react'

interface CustomerDetailProps {
  customerId: string
  onEdit: () => void
  onBack: () => void
}

/**
 * CustomerDetail
 * Ficha del cliente en solo lectura. Las tiendas muestran además su dirección,
 * su configuración de cobro y sus cuentas de cobro.
 */
export const CustomerDetail = ({
  customerId,
  onEdit,
  onBack,
}: CustomerDetailProps) => {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await customersService.getCustomer(customerId)
        setCustomer(data)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Error al cargar el cliente')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCustomer()
  }, [customerId])

  // Loading state
  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    )
  }

  // Error state (404 or other errors)
  if (error || !customer) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="mb-4 text-destructive">
            {error || 'Cliente no encontrado'}
          </p>
          <Button onClick={onBack} variant="outline">
            Volver
          </Button>
        </div>
      </Card>
    )
  }

  const isStore = customer.type === 'store'

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Volver
        </Button>
        <Button onClick={onEdit}>Editar</Button>
      </div>

      {/* Identity Information Section */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <h3 className="text-lg font-semibold">Información de Identidad</h3>
          <Badge variant="outline">{CUSTOMER_TYPE_LABELS[customer.type]}</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nombre</p>
            <p className="text-base">{customer.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Identificación
            </p>
            <p className="text-base">
              {customer.identity_number
                ? `${customer.identity_type ?? ''} ${customer.identity_number}`.trim()
                : '—'}
            </p>
          </div>
          {isStore && (
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">
                Razón Social
              </p>
              <p className="text-base">{customer.legal_name}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Address Section */}
      {isStore && (
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Dirección</h3>
        {customer.address ? (
          <div className="space-y-2">
            <p className="text-base">{customer.address.line1}</p>
            {customer.address.line2 && (
              <p className="text-base">{customer.address.line2}</p>
            )}
            <p className="text-base">
              {customer.address.city}, {customer.address.state}{' '}
              {customer.address.postal_code}
            </p>
            <p className="text-base">{customer.address.country}</p>
          </div>
        ) : (
          <p className="text-muted-foreground">No hay dirección registrada</p>
        )}
      </Card>
      )}

      {/* Contact Details Section */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Datos de Contacto</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {isStore && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Nombre del Contacto
              </p>
              <p className="text-base">{customer.contact_person_name}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Teléfono
            </p>
            <p className="text-base">{customer.contact_phone_number || '—'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">
              Email del Contacto
            </p>
            <p className="text-base">{customer.contact_person_email || '—'}</p>
          </div>
        </div>
      </Card>

      {/* Configuration Section */}
      {isStore && (
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Configuración</h3>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Porcentaje de Descuento
              </p>
              <p className="text-base">{customer.discount_percentage}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Deducir IVA
              </p>
              <p className="flex items-center gap-2 text-base">
                {customer.deduct_vat ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Sí
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-red-600" />
                    No
                  </>
                )}
              </p>
            </div>
          </div>

          {customer.collection_doc_config && (
            <div>
              <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                Configuración del Documento de Cobro
              </h4>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  {customer.collection_doc_config.include_products_detail ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Incluir detalle de productos</span>
                </div>
                <div className="flex items-center gap-2">
                  {customer.collection_doc_config.include_unit_value ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Incluir valor unitario</span>
                </div>
                <div className="flex items-center gap-2">
                  {customer.collection_doc_config.include_sku_in_detail ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Incluir SKU en detalle</span>
                </div>
                <div className="flex items-center gap-2">
                  {customer.collection_doc_config.detail_in_appendix ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Detalle en apéndice</span>
                </div>
                <div className="flex items-center gap-2">
                  {customer.collection_doc_config.include_legal_income_note ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">
                    Incluir nota legal de ingresos
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
      )}

      {/* Collections Section */}
      {isStore && (
        <div className="mt-8">
          <CollectionsTable customerId={customerId} />
        </div>
      )}
    </div>
  )
}
