import { useState, useEffect } from 'react'
import { Store } from '@/types/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { storesService } from '@/services/stores'
import { Check, X } from 'lucide-react'

interface StoresDetailProps {
  storeId: string
  onEdit: () => void
  onBack: () => void
}

/**
 * StoresDetail component
 * Displays complete store information in read-only view
 */
export const StoresDetail = ({
  storeId,
  onEdit,
  onBack,
}: StoresDetailProps) => {
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await storesService.getStore(storeId)
        setStore(data)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Error al cargar la tienda')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStore()
  }, [storeId])

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
  if (error || !store) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="mb-4 text-destructive">
            {error || 'Tienda no encontrada'}
          </p>
          <Button onClick={onBack} variant="outline">
            Volver
          </Button>
        </div>
      </Card>
    )
  }

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
        <h3 className="mb-4 text-lg font-semibold">Información de Identidad</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Número de Identificación
            </p>
            <p className="text-base">{store.identity_number}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Tipo de Identificación
            </p>
            <p className="text-base">{store.identity_type}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nombre</p>
            <p className="text-base">{store.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Razón Social
            </p>
            <p className="text-base">{store.legal_name}</p>
          </div>
        </div>
      </Card>

      {/* Address Section */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Dirección</h3>
        {store.address ? (
          <div className="space-y-2">
            <p className="text-base">{store.address.line1}</p>
            {store.address.line2 && (
              <p className="text-base">{store.address.line2}</p>
            )}
            <p className="text-base">
              {store.address.city}, {store.address.state}{' '}
              {store.address.postal_code}
            </p>
            <p className="text-base">{store.address.country}</p>
          </div>
        ) : (
          <p className="text-muted-foreground">No hay dirección registrada</p>
        )}
      </Card>

      {/* Contact Details Section */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Datos de Contacto</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Nombre del Contacto
            </p>
            <p className="text-base">{store.contact_person_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Teléfono
            </p>
            <p className="text-base">{store.contact_phone_number}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-muted-foreground">
              Email del Contacto
            </p>
            <p className="text-base">{store.contact_person_email}</p>
          </div>
        </div>
      </Card>

      {/* Configuration Section */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Configuración</h3>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Porcentaje de Descuento
              </p>
              <p className="text-base">{store.discount_percentage}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Deducir IVA
              </p>
              <p className="flex items-center gap-2 text-base">
                {store.deduct_vat ? (
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

          {store.collection_doc_config && (
            <div>
              <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                Configuración del Documento de Cobro
              </h4>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  {store.collection_doc_config.include_products_detail ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Incluir detalle de productos</span>
                </div>
                <div className="flex items-center gap-2">
                  {store.collection_doc_config.include_unit_value ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Incluir valor unitario</span>
                </div>
                <div className="flex items-center gap-2">
                  {store.collection_doc_config.include_sku_in_detail ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Incluir SKU en detalle</span>
                </div>
                <div className="flex items-center gap-2">
                  {store.collection_doc_config.detail_in_appendix ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">Detalle en apéndice</span>
                </div>
                <div className="flex items-center gap-2">
                  {store.collection_doc_config.include_legal_income_note ? (
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
    </div>
  )
}
