# Spec: Collection State Management

## ADDED Requirements

### Requirement: User can finalize draft collection

The system SHALL allow users to finalize a draft collection, which generates the PDF document and transitions to active state.

#### Scenario: Finalize action available for draft
- **WHEN** user opens actions dropdown for draft collection
- **THEN** "Finalizar" option is visible

#### Scenario: Confirm before finalizing
- **WHEN** user clicks "Finalizar" action
- **THEN** confirmation dialog displays "¿Finalizar esta cuenta de cobro? Se generará el PDF y no podrá editarse."

#### Scenario: Finalize on confirmation
- **WHEN** user confirms finalization
- **THEN** POST request to /collections/{id}/finalize endpoint

#### Scenario: Update state to active on success
- **WHEN** finalization succeeds
- **THEN** collection state updates to "active" in table and success toast "Cuenta de cobro finalizada exitosamente"

#### Scenario: Display PDF link after finalization
- **WHEN** collection transitions to active state
- **THEN** PDF column displays clickable link icon with document_id

#### Scenario: Show error on finalization failure
- **WHEN** finalization request fails
- **THEN** error toast displays "Error al finalizar: {error message}"

### Requirement: User can mark collection as paid

The system SHALL allow users to mark an active collection as paid with payment details.

#### Scenario: Mark as paid action available for active
- **WHEN** user opens actions dropdown for active collection
- **THEN** "Marcar como pagado" option is visible

#### Scenario: Prompt for payment details
- **WHEN** user clicks "Marcar como pagado" action
- **THEN** dialog opens with fields: payment_method (dropdown), payment_reference (text input)

#### Scenario: Payment method options
- **WHEN** payment details dialog is displayed
- **THEN** payment_method dropdown shows options: "Transferencia", "Efectivo", "Tarjeta", "Otro"

#### Scenario: Submit paid state with details
- **WHEN** user fills payment details and confirms
- **THEN** PATCH request to /collections/{id}/state with state "paid", payment_method, and payment_reference

#### Scenario: Update state to paid on success
- **WHEN** paid state update succeeds
- **THEN** collection state updates to "paid" in table and success toast "Cuenta de cobro marcada como pagada"

#### Scenario: Payment method is required
- **WHEN** user attempts to confirm without selecting payment method
- **THEN** validation error message "Seleccione un método de pago"

#### Scenario: Payment reference is optional
- **WHEN** user confirms with payment method but empty reference
- **THEN** request proceeds with null payment_reference

### Requirement: User can cancel collection

The system SHALL allow users to cancel draft or active collections with a cancellation reason.

#### Scenario: Cancel action available for draft
- **WHEN** user opens actions dropdown for draft collection
- **THEN** "Cancelar" option is visible

#### Scenario: Cancel action available for active
- **WHEN** user opens actions dropdown for active collection
- **THEN** "Cancelar" option is visible

#### Scenario: Cancel action not available for terminal states
- **WHEN** user opens actions dropdown for paid or cancelled collection
- **THEN** "Cancelar" option is not visible

#### Scenario: Prompt for cancel reason
- **WHEN** user clicks "Cancelar" action
- **THEN** dialog opens with text area for cancel_reason

#### Scenario: Submit cancelled state with reason
- **WHEN** user enters cancel reason and confirms
- **THEN** PATCH request to /collections/{id}/state with state "cancelled" and cancel_reason

#### Scenario: Update state to cancelled on success
- **WHEN** cancelled state update succeeds
- **THEN** collection state updates to "cancelled" in table and success toast "Cuenta de cobro cancelada"

#### Scenario: Cancel reason is required
- **WHEN** user attempts to confirm with empty cancel reason
- **THEN** validation error message "Ingrese el motivo de cancelación"

#### Scenario: Cancel reason character limit
- **WHEN** user enters more than 500 characters in cancel reason
- **THEN** validation error message "El motivo no puede exceder 500 caracteres"

### Requirement: System validates state transitions

The system SHALL enforce valid state transitions according to the state machine rules.

#### Scenario: Allow draft to active transition
- **WHEN** collection is in draft state
- **THEN** finalize action (draft → active) is enabled

#### Scenario: Allow draft to cancelled transition
- **WHEN** collection is in draft state
- **THEN** cancel action (draft → cancelled) is enabled

#### Scenario: Allow active to paid transition
- **WHEN** collection is in active state
- **THEN** mark as paid action (active → paid) is enabled

#### Scenario: Allow active to cancelled transition
- **WHEN** collection is in active state
- **THEN** cancel action (active → cancelled) is enabled

#### Scenario: Prevent transitions from paid state
- **WHEN** collection is in paid state
- **THEN** no state transition actions are available (terminal state)

#### Scenario: Prevent transitions from cancelled state
- **WHEN** collection is in cancelled state
- **THEN** no state transition actions are available (terminal state)

#### Scenario: Backend validates transitions
- **WHEN** invalid state transition is attempted
- **THEN** backend returns error and frontend displays "Transición de estado inválida"

### Requirement: User can view collection details

The system SHALL allow users to view full collection details including items, pricing, and metadata.

#### Scenario: View details action for all states
- **WHEN** user opens actions dropdown for any collection
- **THEN** "Ver detalles" option is visible

#### Scenario: Open details modal
- **WHEN** user clicks "Ver detalles" action
- **THEN** modal opens displaying collection information

#### Scenario: Display collection metadata
- **WHEN** details modal is open
- **THEN** modal shows: collection_number, created_at, state, payment_due_date, notes

#### Scenario: Display collection items
- **WHEN** details modal is open
- **THEN** modal shows table of items with: product_name, variant_color, size_name, variant_sku, quantity, unit_price_original, unit_price_final

#### Scenario: Display pricing breakdown
- **WHEN** details modal is open
- **THEN** modal shows: subtotal_before_discount, discount_percentage, discount_amount, subtotal_after_discount, vat_deducted, vat_amount, total_price

#### Scenario: Display payment details for paid collections
- **WHEN** details modal is open for paid collection
- **THEN** modal shows: payment_received_at, payment_method, payment_reference

#### Scenario: Display cancellation details for cancelled collections
- **WHEN** details modal is open for cancelled collection
- **THEN** modal shows: cancelled_at, cancelled_by, cancel_reason

### Requirement: User can edit draft collection

The system SHALL allow users to edit draft collection items and metadata.

#### Scenario: Edit action available for draft only
- **WHEN** user opens actions dropdown for draft collection
- **THEN** "Editar" option is visible

#### Scenario: Edit action not available for other states
- **WHEN** user opens actions dropdown for active, paid, or cancelled collection
- **THEN** "Editar" option is not visible

#### Scenario: Open edit modal
- **WHEN** user clicks "Editar" action on draft collection
- **THEN** modal opens with current items, notes, and payment_due_date pre-filled

#### Scenario: Update items and recalculate
- **WHEN** user modifies items and saves
- **THEN** PUT request to /collections/{id}/items with updated items

#### Scenario: Backend recalculates pricing on update
- **WHEN** items update succeeds
- **THEN** collection updates with new pricing values from backend

#### Scenario: Update metadata only
- **WHEN** user modifies notes or payment_due_date and saves
- **THEN** PATCH request to /collections/{id} with updated metadata

### Requirement: System refreshes table after state changes

The system SHALL update the collections table to reflect state changes immediately.

#### Scenario: Refresh table after finalization
- **WHEN** collection is finalized successfully
- **THEN** table row updates to show active state badge and PDF link

#### Scenario: Refresh table after marking as paid
- **WHEN** collection is marked as paid successfully
- **THEN** table row updates to show paid state badge

#### Scenario: Refresh table after cancellation
- **WHEN** collection is cancelled successfully
- **THEN** table row updates to show cancelled state badge

#### Scenario: Refresh table after edit
- **WHEN** draft collection is edited successfully
- **THEN** table row updates to show new total_price
