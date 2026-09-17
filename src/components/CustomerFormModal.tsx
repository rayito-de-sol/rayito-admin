import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { customersService } from '@/services/customers'
import { CUSTOMER_TYPE_LABELS } from '@/types/customer'
import type {
  Customer,
  CustomerType,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from '@/types/customer'
import { toast } from '@/utils/toast'

const IDENTITY_TYPES = ['NIT', 'RUT', 'CC', 'CE', 'RFC']

interface CustomerFormModalProps {
  open: boolean
  /** null = crear */
  customer: Customer | null
  /** Tipo preseleccionado al crear */
  defaultType?: CustomerType
  onClose: () => void
  onSuccess: (customer: Customer) => void
}

interface FormValues {
  type: CustomerType
  name: string
  identityType: string
  identityNumber: string
  legalName: string
  line1: string
  line2: string
  city: string
  state: string
  postalCode: string
  country: string
  contactPersonName: string
  contactPersonEmail: string
  contactPhoneNumber: string
  discountPercentage: string
  deductVat: boolean
  includeProductsDetail: boolean
  includeUnitValue: boolean
  includeSkuInDetail: boolean
  detailInAppendix: boolean
  includeLegalIncomeNote: boolean
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const EMPTY_VALUES: FormValues = {
  type: 'person',
  name: '',
  identityType: '',
  identityNumber: '',
  legalName: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  contactPersonName: '',
  contactPersonEmail: '',
  contactPhoneNumber: '',
  discountPercentage: '0',
  deductVat: false,
  includeProductsDetail: false,
  includeUnitValue: false,
  includeSkuInDetail: false,
  detailInAppendix: false,
  includeLegalIncomeNote: false,
}

const toFormValues = (customer: Customer): FormValues => ({
  type: customer.type,
  name: customer.name,
  identityType: customer.identity_type ?? '',
  identityNumber: customer.identity_number ?? '',
  legalName: customer.legal_name ?? '',
  line1: customer.address?.line1 ?? '',
  line2: customer.address?.line2 ?? '',
  city: customer.address?.city ?? '',
  state: customer.address?.state ?? '',
  postalCode: customer.address?.postal_code ?? '',
  country: customer.address?.country ?? '',
  contactPersonName: customer.contact_person_name ?? '',
  contactPersonEmail: customer.contact_person_email ?? '',
  contactPhoneNumber: customer.contact_phone_number ?? '',
  discountPercentage: String(customer.discount_percentage ?? 0),
  deductVat: customer.deduct_vat ?? false,
  includeProductsDetail:
    customer.collection_doc_config?.include_products_detail ?? false,
  includeUnitValue: customer.collection_doc_config?.include_unit_value ?? false,
  includeSkuInDetail:
    customer.collection_doc_config?.include_sku_in_detail ?? false,
  detailInAppendix: customer.collection_doc_config?.detail_in_appendix ?? false,
  includeLegalIncomeNote:
    customer.collection_doc_config?.include_legal_income_note ?? false,
})

/**
 * Normaliza el formulario al cuerpo que espera el API. Una persona solo envía
 * sus propios campos: la dirección y la configuración del documento de cobro
 * pertenecen a las tiendas.
 */
const toRequest = (values: FormValues): CreateCustomerRequest => {
  const base: CreateCustomerRequest = {
    type: values.type,
    name: values.name.trim(),
    identity_type: values.identityType || undefined,
    identity_number: values.identityNumber.trim() || undefined,
    contact_phone_number: values.contactPhoneNumber.trim() || undefined,
    contact_person_email:
      values.contactPersonEmail.trim().toLowerCase() || undefined,
  }

  if (values.type === 'person') {
    return base
  }

  return {
    ...base,
    legal_name: values.legalName.trim(),
    line1: values.line1.trim(),
    line2: values.line2.trim() || undefined,
    city: values.city.trim(),
    state: values.state.trim(),
    postal_code: values.postalCode.trim(),
    country: values.country.trim().toUpperCase(),
    contact_person_name: values.contactPersonName.trim(),
    discount_percentage: parseFloat(values.discountPercentage) || 0,
    deduct_vat: values.deductVat,
    include_products_detail: values.includeProductsDetail,
    include_unit_value: values.includeUnitValue,
    include_sku_in_detail: values.includeSkuInDetail,
    detail_in_appendix: values.detailInAppendix,
    include_legal_income_note: values.includeLegalIncomeNote,
  }
}

/**
 * Envía solo los campos que cambiaron. Reemplaza la comparación campo por campo
 * que tenía el formulario anterior.
 */
const diffRequest = (
  initial: CreateCustomerRequest,
  current: CreateCustomerRequest
): UpdateCustomerRequest => {
  const initialRecord = initial as unknown as Record<string, unknown>
  return Object.fromEntries(
    Object.entries(current).filter(
      ([key, value]) => key !== 'type' && value !== initialRecord[key]
    )
  ) as UpdateCustomerRequest
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const COUNTRY_PATTERN = /^[A-Za-z]{2}$/

const validate = (values: FormValues): FormErrors => {
  const errors: FormErrors = {}

  if (!values.name.trim()) {
    errors.name = 'Este campo es requerido'
  }
  if (values.contactPersonEmail.trim() && !EMAIL_PATTERN.test(values.contactPersonEmail.trim())) {
    errors.contactPersonEmail = 'Correo electrónico inválido'
  }

  if (values.type !== 'store') {
    return errors
  }

  if (!values.identityNumber.trim()) errors.identityNumber = 'Este campo es requerido'
  if (!values.identityType) errors.identityType = 'Este campo es requerido'
  if (!values.legalName.trim()) errors.legalName = 'Este campo es requerido'
  if (!values.line1.trim()) errors.line1 = 'Este campo es requerido'
  if (!values.city.trim()) errors.city = 'Este campo es requerido'
  if (!values.state.trim()) errors.state = 'Este campo es requerido'
  if (!values.postalCode.trim()) errors.postalCode = 'Este campo es requerido'
  if (!values.country.trim()) {
    errors.country = 'Este campo es requerido'
  } else if (!COUNTRY_PATTERN.test(values.country.trim())) {
    errors.country = 'Use el código de 2 letras (ej. CO)'
  }
  if (!values.contactPersonName.trim()) errors.contactPersonName = 'Este campo es requerido'
  if (!values.contactPersonEmail.trim()) errors.contactPersonEmail = 'Este campo es requerido'

  const discount = parseFloat(values.discountPercentage)
  if (isNaN(discount) || discount < 0 || discount > 100) {
    errors.discountPercentage = 'Debe estar entre 0 y 100'
  }

  return errors
}

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 text-sm text-destructive">{message}</p> : null

/**
 * CustomerFormModal
 * Alta y edición de clientes. Al elegir "Tienda" aparecen la dirección, el
 * descuento y la configuración del documento de cobro; una persona solo necesita
 * el nombre. Se usa desde la página de Clientes y desde el modal de venta, así
 * que los ids llevan prefijo para no chocar con el formulario que lo abre.
 */
export const CustomerFormModal = ({
  open,
  customer,
  defaultType = 'person',
  onClose,
  onSuccess,
}: CustomerFormModalProps) => {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const isEdit = !!customer
  const isStore = values.type === 'store'

  useEffect(() => {
    if (!open) return
    setErrors({})
    setApiError(null)
    setValues(customer ? toFormValues(customer) : { ...EMPTY_VALUES, type: defaultType })
  }, [open, customer, defaultType])

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((previous) => ({ ...previous, [key]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setApiError(null)

    const validationErrors = validate(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    try {
      const request = toRequest(values)
      const saved = customer
        ? await customersService.updateCustomer(
            customer.id,
            diffRequest(toRequest(toFormValues(customer)), request)
          )
        : await customersService.createCustomer(request)

      toast.success(isEdit ? 'Cliente actualizado' : 'Cliente creado')
      onSuccess(saved)
      onClose()
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Error al guardar el cliente')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {apiError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {apiError}
            </div>
          )}

          <div>
            <Label htmlFor="customer-type" className="mb-2">
              Tipo de cliente <span className="text-destructive">*</span>
            </Label>
            <Select
              value={values.type}
              onValueChange={(value) => set('type', value as CustomerType)}
              disabled={isEdit || submitting}
            >
              <SelectTrigger id="customer-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="person">{CUSTOMER_TYPE_LABELS.person}</SelectItem>
                <SelectItem value="store">{CUSTOMER_TYPE_LABELS.store}</SelectItem>
              </SelectContent>
            </Select>
            {isEdit && (
              <p className="mt-1 text-xs text-muted-foreground">
                El tipo de cliente no se puede cambiar.
              </p>
            )}
          </div>

          {/* Identidad */}
          <section className="space-y-4 border-t border-border pt-4">
            <h3 className="text-sm font-semibold">Información de Identidad</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className={isStore ? '' : 'md:col-span-2'}>
                <Label htmlFor="customer-name" className="mb-2">
                  Nombre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customer-name"
                  value={values.name}
                  onChange={(e) => set('name', e.target.value)}
                  disabled={submitting}
                />
                <FieldError message={errors.name} />
              </div>

              {isStore && (
                <div>
                  <Label htmlFor="customer-legal-name" className="mb-2">
                    Razón Social <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customer-legal-name"
                    value={values.legalName}
                    onChange={(e) => set('legalName', e.target.value)}
                    disabled={submitting}
                  />
                  <FieldError message={errors.legalName} />
                </div>
              )}

              <div>
                <Label htmlFor="customer-identity-type" className="mb-2">
                  Tipo de Identificación{' '}
                  {isStore && <span className="text-destructive">*</span>}
                </Label>
                <Select
                  value={values.identityType}
                  onValueChange={(value) => set('identityType', value || '')}
                  disabled={submitting}
                >
                  <SelectTrigger id="customer-identity-type">
                    <SelectValue placeholder="Seleccione tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {IDENTITY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={errors.identityType} />
              </div>

              <div>
                <Label htmlFor="customer-identity-number" className="mb-2">
                  Número de Identificación{' '}
                  {isStore && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id="customer-identity-number"
                  value={values.identityNumber}
                  onChange={(e) => set('identityNumber', e.target.value)}
                  disabled={submitting}
                />
                <FieldError message={errors.identityNumber} />
              </div>
            </div>
          </section>

          {/* Contacto */}
          <section className="space-y-4 border-t border-border pt-4">
            <h3 className="text-sm font-semibold">Datos de Contacto</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="customer-phone" className="mb-2">
                  Teléfono {isStore && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id="customer-phone"
                  value={values.contactPhoneNumber}
                  onChange={(e) => set('contactPhoneNumber', e.target.value)}
                  placeholder="+57..."
                  disabled={submitting}
                />
                <FieldError message={errors.contactPhoneNumber} />
              </div>

              <div>
                <Label htmlFor="customer-email" className="mb-2">
                  Email {isStore && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={values.contactPersonEmail}
                  onChange={(e) => set('contactPersonEmail', e.target.value)}
                  disabled={submitting}
                />
                <FieldError message={errors.contactPersonEmail} />
              </div>

              {isStore && (
                <div className="md:col-span-2">
                  <Label htmlFor="customer-contact-name" className="mb-2">
                    Nombre del Contacto <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customer-contact-name"
                    value={values.contactPersonName}
                    onChange={(e) => set('contactPersonName', e.target.value)}
                    disabled={submitting}
                  />
                  <FieldError message={errors.contactPersonName} />
                </div>
              )}
            </div>
          </section>

          {isStore && (
            <>
              {/* Dirección */}
              <section className="space-y-4 border-t border-border pt-4">
                <h3 className="text-sm font-semibold">Dirección</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label htmlFor="customer-line1" className="mb-2">
                      Dirección Línea 1 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="customer-line1"
                      value={values.line1}
                      onChange={(e) => set('line1', e.target.value)}
                      disabled={submitting}
                    />
                    <FieldError message={errors.line1} />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="customer-line2" className="mb-2">
                      Dirección Línea 2
                    </Label>
                    <Input
                      id="customer-line2"
                      value={values.line2}
                      onChange={(e) => set('line2', e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="customer-city" className="mb-2">
                      Ciudad <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="customer-city"
                      value={values.city}
                      onChange={(e) => set('city', e.target.value)}
                      disabled={submitting}
                    />
                    <FieldError message={errors.city} />
                  </div>

                  <div>
                    <Label htmlFor="customer-state" className="mb-2">
                      Departamento <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="customer-state"
                      value={values.state}
                      onChange={(e) => set('state', e.target.value)}
                      disabled={submitting}
                    />
                    <FieldError message={errors.state} />
                  </div>

                  <div>
                    <Label htmlFor="customer-postal-code" className="mb-2">
                      Código Postal <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="customer-postal-code"
                      value={values.postalCode}
                      onChange={(e) => set('postalCode', e.target.value)}
                      disabled={submitting}
                    />
                    <FieldError message={errors.postalCode} />
                  </div>

                  <div>
                    <Label htmlFor="customer-country" className="mb-2">
                      País <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="customer-country"
                      value={values.country}
                      onChange={(e) => set('country', e.target.value)}
                      placeholder="CO"
                      maxLength={2}
                      disabled={submitting}
                    />
                    <FieldError message={errors.country} />
                  </div>
                </div>
              </section>

              {/* Configuración */}
              <section className="space-y-4 border-t border-border pt-4">
                <h3 className="text-sm font-semibold">Configuración</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="customer-discount" className="mb-2">
                      Porcentaje de Descuento (%)
                    </Label>
                    <Input
                      id="customer-discount"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={values.discountPercentage}
                      onChange={(e) => set('discountPercentage', e.target.value)}
                      disabled={submitting}
                    />
                    <FieldError message={errors.discountPercentage} />
                  </div>

                  <div className="flex items-center space-x-2 pt-7">
                    <Checkbox
                      id="customer-deduct-vat"
                      checked={values.deductVat}
                      onCheckedChange={(checked) => set('deductVat', checked === true)}
                      disabled={submitting}
                    />
                    <Label htmlFor="customer-deduct-vat" className="cursor-pointer">
                      Deducir IVA
                    </Label>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-medium">
                    Configuración del Documento de Cobro
                  </h4>
                  <div className="space-y-2">
                    {(
                      [
                        ['includeProductsDetail', 'Incluir detalle de productos'],
                        ['includeUnitValue', 'Incluir valor unitario'],
                        ['includeSkuInDetail', 'Incluir SKU en detalle'],
                        ['detailInAppendix', 'Detalle en apéndice'],
                        ['includeLegalIncomeNote', 'Incluir nota legal de ingresos'],
                      ] as [keyof FormValues, string][]
                    ).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`customer-${key}`}
                          checked={values[key] as boolean}
                          onCheckedChange={(checked) =>
                            set(key, (checked === true) as never)
                          }
                          disabled={submitting}
                        />
                        <Label htmlFor={`customer-${key}`} className="cursor-pointer">
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
