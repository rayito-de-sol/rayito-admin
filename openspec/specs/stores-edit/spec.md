## ADDED Requirements

### Requirement: System SHALL provide form for editing existing store
The system SHALL provide an edit form pre-filled with current store data allowing updates to any field.

#### Scenario: Display edit form with current data
- **WHEN** user clicks "Editar" button from store details view
- **THEN** system displays form with all fields pre-filled with current store values

#### Scenario: Form structure matches create form
- **WHEN** edit form is displayed
- **THEN** form includes same sections and fields as create form (Identity Information, Address, Contact Details, Configuration)

### Requirement: System SHALL validate fields on edit
The system SHALL apply same validation rules as create form for all fields.

#### Scenario: Edit with invalid email
- **WHEN** user modifies contact_person_email to invalid format and submits
- **THEN** system displays error message "Formato de email inválido" and prevents submission

#### Scenario: Edit with invalid discount percentage
- **WHEN** user modifies discount_percentage to value outside 0-100 range and submits
- **THEN** system displays error message "El descuento debe estar entre 0 y 100" and prevents submission

#### Scenario: Edit with missing required field
- **WHEN** user clears required field (name, identity_number, etc.) and submits
- **THEN** system displays error message "Este campo es requerido" and prevents submission

### Requirement: System SHALL update store via API
The system SHALL submit modified data to PATCH /stores/:id endpoint supporting partial updates.

#### Scenario: Successful store update
- **WHEN** user modifies one or more fields and submits valid form
- **THEN** system sends PATCH request to /api/v1/stores/:id with changed fields, displays success message "Tienda actualizada exitosamente", and returns to store details view with updated data

#### Scenario: Update with duplicate identity number
- **WHEN** user changes identity_number to value already used by another store and API returns 409 conflict
- **THEN** system displays error message "Ya existe una tienda con este número de identificación" near identity_number field

#### Scenario: Update non-existent store
- **WHEN** PATCH /stores/:id returns 404 not found error
- **THEN** system displays error message "Tienda no encontrada" and provides button to return to stores list

#### Scenario: Authorization error on update
- **WHEN** user with analyst role attempts to update store and API returns 403 forbidden
- **THEN** system displays error message "No tienes permisos para editar tiendas"

### Requirement: System SHALL allow canceling edit
The system SHALL provide cancel button to return to store details view without saving changes.

#### Scenario: Cancel button click
- **WHEN** user clicks "Cancelar" button on edit form
- **THEN** system returns to store details view without making API request, showing original unchanged data

### Requirement: System SHALL show loading state during update
The system SHALL disable form inputs and show loading indicator while API request is in progress.

#### Scenario: Update submission in progress
- **WHEN** user submits edit form and API request is pending
- **THEN** system disables all form inputs and submit button, displays loading spinner on submit button

### Requirement: System SHALL preserve unchanged fields
The system SHALL only send modified fields in PATCH request to support partial updates.

#### Scenario: Update single field
- **WHEN** user modifies only contact_phone_number and submits
- **THEN** system sends PATCH request with only contact_phone_number in payload, not all fields
