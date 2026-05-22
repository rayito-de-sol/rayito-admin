# Spec: Collection Creation

## ADDED Requirements

### Requirement: User can open collection creation modal

The system SHALL display a "Crear cuenta de cobro" button on the store detail page that opens a modal for creating new collections.

#### Scenario: Button visible on store detail page
- **WHEN** user views a store detail page
- **THEN** "Crear cuenta de cobro" button is visible below store information

#### Scenario: Modal opens on button click
- **WHEN** user clicks "Crear cuenta de cobro" button
- **THEN** collection creation modal opens with empty form

#### Scenario: Modal closes on cancel
- **WHEN** user clicks "Cancelar" button in modal
- **THEN** modal closes without creating collection

### Requirement: User can select product variants

The system SHALL allow users to search and select product variants to add to the collection.

#### Scenario: Product selector displays variants
- **WHEN** user clicks "Agregar producto" button
- **THEN** combobox displays searchable list of product variants with name, color, size, and SKU

#### Scenario: Add variant to collection
- **WHEN** user selects a variant from the list
- **THEN** variant is added to collection items list with quantity 1

#### Scenario: Prevent duplicate variants
- **WHEN** user attempts to add a variant already in the list
- **THEN** variant does not appear in the selector dropdown

#### Scenario: Remove variant from collection
- **WHEN** user clicks delete icon on a collection item
- **THEN** item is removed from collection items list

### Requirement: User can set item quantities

The system SHALL allow users to specify quantities for each collection item.

#### Scenario: Default quantity is 1
- **WHEN** user adds a variant to collection
- **THEN** quantity field shows default value of 1

#### Scenario: Update item quantity
- **WHEN** user changes quantity to a positive integer
- **THEN** quantity value updates in the item display

#### Scenario: Reject zero quantity
- **WHEN** user enters 0 as quantity
- **THEN** validation error message "La cantidad debe ser mayor a cero"

#### Scenario: Reject negative quantity
- **WHEN** user enters negative number as quantity
- **THEN** validation error message "La cantidad debe ser mayor a cero"

#### Scenario: Reject non-integer quantity
- **WHEN** user enters decimal number (e.g., 1.5)
- **THEN** validation error message "La cantidad debe ser un número entero"

### Requirement: User can add optional metadata

The system SHALL allow users to add optional notes and payment due date to collections.

#### Scenario: Add notes to collection
- **WHEN** user enters text in notes field
- **THEN** notes are included in collection creation request

#### Scenario: Enforce notes character limit
- **WHEN** user enters more than 500 characters in notes field
- **THEN** validation error message "Las notas no pueden exceder 500 caracteres"

#### Scenario: Select payment due date
- **WHEN** user selects a future date in date picker
- **THEN** payment due date is included in collection creation request

#### Scenario: Reject past payment due date
- **WHEN** user selects a date in the past
- **THEN** validation error message "La fecha de vencimiento debe ser futura"

#### Scenario: Reject payment due date beyond 1 year
- **WHEN** user selects a date more than 1 year in the future
- **THEN** validation error message "La fecha de vencimiento no puede ser mayor a 1 año"

### Requirement: User can submit collection creation

The system SHALL validate the form and submit collection creation request to the backend.

#### Scenario: Submit valid collection
- **WHEN** user clicks "Crear borrador" with at least 1 item and valid data
- **THEN** POST request to /collections endpoint with store_id, items, notes, payment_due_date

#### Scenario: Reject empty items list
- **WHEN** user clicks "Crear borrador" with no items
- **THEN** validation error message "Debe agregar al menos un producto"

#### Scenario: Show loading state during submission
- **WHEN** collection creation request is in progress
- **THEN** submit button shows loading spinner and is disabled

#### Scenario: Close modal on success
- **WHEN** backend returns successful creation response
- **THEN** modal closes and success toast notification "Cuenta de cobro creada exitosamente"

#### Scenario: Show error message on failure
- **WHEN** backend returns error response
- **THEN** error message displays in modal with backend error text

### Requirement: System displays pricing from backend

The system SHALL display the pricing breakdown returned by the backend after collection creation.

#### Scenario: Display pricing summary in modal
- **WHEN** user has added items to collection
- **THEN** modal shows "Resumen" section with placeholder text "(Se calculará al crear)"

#### Scenario: Display pricing breakdown after creation
- **WHEN** backend returns collection with calculated pricing
- **THEN** collection appears in table with subtotal_before_discount, discount_amount, subtotal_after_discount, vat_amount, and total_price

### Requirement: Form validation prevents invalid submissions

The system SHALL validate all inputs before allowing submission.

#### Scenario: Disable submit button until valid
- **WHEN** form has validation errors (no items, invalid quantity, invalid date)
- **THEN** submit button "Crear borrador" is disabled

#### Scenario: Enable submit button when valid
- **WHEN** form has at least 1 item with valid quantities and optional fields are valid or empty
- **THEN** submit button "Crear borrador" is enabled
