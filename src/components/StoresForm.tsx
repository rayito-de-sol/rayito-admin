import { useState, FormEvent } from 'react'
import { Store, CreateStoreRequest, UpdateStoreRequest } from '@/types/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { storesService } from '@/services/stores'

interface StoresFormProps {
  mode: 'create' | 'edit'
  initialData?: Store
  onSuccess: () => void
  onCancel: () => void
}

interface FormErrors {
  [key: string]: string
}

const IDENTITY_TYPES = ['NIT', 'RUT', 'CC', 'CE', 'RFC'] as const

/**
 * StoresForm component
 * Comprehensive form for creating and editing stores
 */
export const StoresForm = ({
  mode,
  initialData,
  onSuccess,
  onCancel,
}: StoresFormProps) => {
  // Identity Information
  const [identityNumber, setIdentityNumber] = useState(
    initialData?.identity_number || ''
  )
  const [name, setName] = useState(initialData?.name || '')
  const [legalName, setLegalName] = useState(initialData?.legal_name || '')
  const [identityType, setIdentityType] = useState(
    initialData?.identity_type || ''
  )

  // Address
  const [line1, setLine1] = useState(initialData?.address?.line1 || '')
  const [line2, setLine2] = useState(initialData?.address?.line2 || '')
  const [city, setCity] = useState(initialData?.address?.city || '')
  const [state, setState] = useState(initialData?.address?.state || '')
  const [postalCode, setPostalCode] = useState(
    initialData?.address?.postal_code || ''
  )
  const [country, setCountry] = useState(initialData?.address?.country || '')

  // Contact Details
  const [contactPersonName, setContactPersonName] = useState(
    initialData?.contact_person_name || ''
  )
  const [contactPersonEmail, setContactPersonEmail] = useState(
    initialData?.contact_person_email || ''
  )
  const [contactPhoneNumber, setContactPhoneNumber] = useState(
    initialData?.contact_phone_number || ''
  )

  // Configuration
  const [discountPercentage, setDiscountPercentage] = useState(
    initialData?.discount_percentage?.toString() || '0'
  )
  const [deductVat, setDeductVat] = useState(initialData?.deduct_vat || false)

  // Collection Document Configuration
  const [includeProductsDetail, setIncludeProductsDetail] = useState(
    initialData?.collection_doc_config?.include_products_detail || false
  )
  const [includeUnitValue, setIncludeUnitValue] = useState(
    initialData?.collection_doc_config?.include_unit_value || false
  )
  const [includeSKUInDetail, setIncludeSKUInDetail] = useState(
    initialData?.collection_doc_config?.include_sku_in_detail || false
  )
  const [detailInAppendix, setDetailInAppendix] = useState(
    initialData?.collection_doc_config?.detail_in_appendix || false
  )
  const [includeLegalIncomeNote, setIncludeLegalIncomeNote] = useState(
    initialData?.collection_doc_config?.include_legal_income_note || false
  )

  // Form state
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  /**
   * Validate form fields
   */
  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    // Required fields
    if (!identityNumber.trim()) {
      newErrors.identityNumber = 'Este campo es requerido'
    }
    if (!name.trim()) {
      newErrors.name = 'Este campo es requerido'
    }
    if (!legalName.trim()) {
      newErrors.legalName = 'Este campo es requerido'
    }
    if (!identityType) {
      newErrors.identityType = 'Este campo es requerido'
    }
    if (!line1.trim()) {
      newErrors.line1 = 'Este campo es requerido'
    }
    if (!city.trim()) {
      newErrors.city = 'Este campo es requerido'
    }
    if (!state.trim()) {
      newErrors.state = 'Este campo es requerido'
    }
    if (!postalCode.trim()) {
      newErrors.postalCode = 'Este campo es requerido'
    }
    if (!country.trim()) {
      newErrors.country = 'Este campo es requerido'
    }
    if (!contactPersonName.trim()) {
      newErrors.contactPersonName = 'Este campo es requerido'
    }
    if (!contactPersonEmail.trim()) {
      newErrors.contactPersonEmail = 'Este campo es requerido'
    }

    // Email format validation
    if (contactPersonEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactPersonEmail)) {
      newErrors.contactPersonEmail = 'Formato de email inválido'
    }

    // Discount percentage range validation (0-100)
    const discountNum = parseFloat(discountPercentage)
    if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
      newErrors.discountPercentage = 'El descuento debe estar entre 0 y 100'
    }

    // Country code validation (2-letter ISO format)
    if (country && !/^[A-Za-z]{2}$/.test(country)) {
      newErrors.country = 'Código de país debe tener 2 letras'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setApiError(null)

    if (!validate()) {
      return
    }

    setSubmitting(true)

    try {
      if (mode === 'create') {
        const data: CreateStoreRequest = {
          identity_number: identityNumber.trim(),
          name: name.trim(),
          legal_name: legalName.trim(),
          identity_type: identityType,
          line1: line1.trim(),
          line2: line2.trim() || undefined,
          city: city.trim(),
          state: state.trim(),
          postal_code: postalCode.trim(),
          country: country.trim().toUpperCase(),
          contact_phone_number: contactPhoneNumber.trim(),
          contact_person_name: contactPersonName.trim(),
          contact_person_email: contactPersonEmail.trim().toLowerCase(),
          discount_percentage: parseFloat(discountPercentage),
          deduct_vat: deductVat,
          include_products_detail: includeProductsDetail,
          include_unit_value: includeUnitValue,
          include_sku_in_detail: includeSKUInDetail,
          detail_in_appendix: detailInAppendix,
          include_legal_income_note: includeLegalIncomeNote,
        }
        await storesService.createStore(data)
      } else {
        // Build update request with only changed fields
        const data: UpdateStoreRequest = {}

        if (identityNumber !== initialData?.identity_number) {
          data.identity_number = identityNumber.trim()
        }
        if (name !== initialData?.name) {
          data.name = name.trim()
        }
        if (legalName !== initialData?.legal_name) {
          data.legal_name = legalName.trim()
        }
        if (identityType !== initialData?.identity_type) {
          data.identity_type = identityType
        }
        if (line1 !== initialData?.address?.line1) {
          data.line1 = line1.trim()
        }
        if (line2 !== (initialData?.address?.line2 || '')) {
          data.line2 = line2.trim() || undefined
        }
        if (city !== initialData?.address?.city) {
          data.city = city.trim()
        }
        if (state !== initialData?.address?.state) {
          data.state = state.trim()
        }
        if (postalCode !== initialData?.address?.postal_code) {
          data.postal_code = postalCode.trim()
        }
        if (country !== initialData?.address?.country) {
          data.country = country.trim().toUpperCase()
        }
        if (contactPhoneNumber !== initialData?.contact_phone_number) {
          data.contact_phone_number = contactPhoneNumber.trim()
        }
        if (contactPersonName !== initialData?.contact_person_name) {
          data.contact_person_name = contactPersonName.trim()
        }
        if (contactPersonEmail !== initialData?.contact_person_email) {
          data.contact_person_email = contactPersonEmail.trim().toLowerCase()
        }
        if (parseFloat(discountPercentage) !== initialData?.discount_percentage) {
          data.discount_percentage = parseFloat(discountPercentage)
        }
        if (deductVat !== initialData?.deduct_vat) {
          data.deduct_vat = deductVat
        }
        if (includeProductsDetail !== initialData?.collection_doc_config?.include_products_detail) {
          data.include_products_detail = includeProductsDetail
        }
        if (includeUnitValue !== initialData?.collection_doc_config?.include_unit_value) {
          data.include_unit_value = includeUnitValue
        }
        if (includeSKUInDetail !== initialData?.collection_doc_config?.include_sku_in_detail) {
          data.include_sku_in_detail = includeSKUInDetail
        }
        if (detailInAppendix !== initialData?.collection_doc_config?.detail_in_appendix) {
          data.detail_in_appendix = detailInAppendix
        }
        if (includeLegalIncomeNote !== initialData?.collection_doc_config?.include_legal_income_note) {
          data.include_legal_income_note = includeLegalIncomeNote
        }

        await storesService.updateStore(initialData!.id, data)
      }

      onSuccess()
    } catch (error) {
      if (error instanceof Error) {
        setApiError(error.message)
      } else {
        setApiError('Error desconocido')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* API Error Display */}
      {apiError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {apiError}
        </div>
      )}

      {/* Identity Information Section */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Información de Identidad</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="identityNumber">
              Número de Identificación <span className="text-destructive">*</span>
            </Label>
            <Input
              id="identityNumber"
              value={identityNumber}
              onChange={(e) => setIdentityNumber(e.target.value)}
              disabled={submitting}
            />
            {errors.identityNumber && (
              <p className="mt-1 text-sm text-destructive">{errors.identityNumber}</p>
            )}
          </div>

          <div>
            <Label htmlFor="identityType">
              Tipo de Identificación <span className="text-destructive">*</span>
            </Label>
            <Select
              value={identityType}
              onValueChange={(value) => setIdentityType(value || '')}
              disabled={submitting}
            >
              <SelectTrigger id="identityType">
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
            {errors.identityType && (
              <p className="mt-1 text-sm text-destructive">{errors.identityType}</p>
            )}
          </div>

          <div>
            <Label htmlFor="name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="legalName">
              Razón Social <span className="text-destructive">*</span>
            </Label>
            <Input
              id="legalName"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              disabled={submitting}
            />
            {errors.legalName && (
              <p className="mt-1 text-sm text-destructive">{errors.legalName}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Address Section */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Dirección</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="line1">
              Dirección Línea 1 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="line1"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              disabled={submitting}
            />
            {errors.line1 && (
              <p className="mt-1 text-sm text-destructive">{errors.line1}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="line2">Dirección Línea 2 (opcional)</Label>
            <Input
              id="line2"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <Label htmlFor="city">
              Ciudad <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={submitting}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-destructive">{errors.city}</p>
            )}
          </div>

          <div>
            <Label htmlFor="state">
              Departamento/Estado <span className="text-destructive">*</span>
            </Label>
            <Input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              disabled={submitting}
            />
            {errors.state && (
              <p className="mt-1 text-sm text-destructive">{errors.state}</p>
            )}
          </div>

          <div>
            <Label htmlFor="postalCode">
              Código Postal <span className="text-destructive">*</span>
            </Label>
            <Input
              id="postalCode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              disabled={submitting}
            />
            {errors.postalCode && (
              <p className="mt-1 text-sm text-destructive">{errors.postalCode}</p>
            )}
          </div>

          <div>
            <Label htmlFor="country">
              País (código ISO 2 letras) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="CO"
              maxLength={2}
              disabled={submitting}
            />
            {errors.country && (
              <p className="mt-1 text-sm text-destructive">{errors.country}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Contact Details Section */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Datos de Contacto</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="contactPersonName">
              Nombre del Contacto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contactPersonName"
              value={contactPersonName}
              onChange={(e) => setContactPersonName(e.target.value)}
              disabled={submitting}
            />
            {errors.contactPersonName && (
              <p className="mt-1 text-sm text-destructive">{errors.contactPersonName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="contactPhoneNumber">Teléfono</Label>
            <Input
              id="contactPhoneNumber"
              value={contactPhoneNumber}
              onChange={(e) => setContactPhoneNumber(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="contactPersonEmail">
              Email del Contacto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contactPersonEmail"
              type="email"
              value={contactPersonEmail}
              onChange={(e) => setContactPersonEmail(e.target.value)}
              disabled={submitting}
            />
            {errors.contactPersonEmail && (
              <p className="mt-1 text-sm text-destructive">{errors.contactPersonEmail}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Configuration Section */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Configuración</h3>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="discountPercentage">Porcentaje de Descuento (%)</Label>
              <Input
                id="discountPercentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                disabled={submitting}
              />
              {errors.discountPercentage && (
                <p className="mt-1 text-sm text-destructive">{errors.discountPercentage}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-7">
              <Checkbox
                id="deductVat"
                checked={deductVat}
                onCheckedChange={(checked) => setDeductVat(checked as boolean)}
                disabled={submitting}
              />
              <Label htmlFor="deductVat" className="cursor-pointer">
                Deducir IVA
              </Label>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium">
              Configuración del Documento de Cobro
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeProductsDetail"
                  checked={includeProductsDetail}
                  onCheckedChange={(checked) =>
                    setIncludeProductsDetail(checked as boolean)
                  }
                  disabled={submitting}
                />
                <Label htmlFor="includeProductsDetail" className="cursor-pointer">
                  Incluir detalle de productos
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeUnitValue"
                  checked={includeUnitValue}
                  onCheckedChange={(checked) =>
                    setIncludeUnitValue(checked as boolean)
                  }
                  disabled={submitting}
                />
                <Label htmlFor="includeUnitValue" className="cursor-pointer">
                  Incluir valor unitario
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeSKUInDetail"
                  checked={includeSKUInDetail}
                  onCheckedChange={(checked) =>
                    setIncludeSKUInDetail(checked as boolean)
                  }
                  disabled={submitting}
                />
                <Label htmlFor="includeSKUInDetail" className="cursor-pointer">
                  Incluir SKU en detalle
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="detailInAppendix"
                  checked={detailInAppendix}
                  onCheckedChange={(checked) =>
                    setDetailInAppendix(checked as boolean)
                  }
                  disabled={submitting}
                />
                <Label htmlFor="detailInAppendix" className="cursor-pointer">
                  Detalle en apéndice
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeLegalIncomeNote"
                  checked={includeLegalIncomeNote}
                  onCheckedChange={(checked) =>
                    setIncludeLegalIncomeNote(checked as boolean)
                  }
                  disabled={submitting}
                />
                <Label htmlFor="includeLegalIncomeNote" className="cursor-pointer">
                  Incluir nota legal de ingresos
                </Label>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              {mode === 'create' ? 'Creando...' : 'Guardando...'}
            </>
          ) : mode === 'create' ? (
            'Crear Tienda'
          ) : (
            'Guardar Cambios'
          )}
        </Button>
      </div>
    </form>
  )
}
