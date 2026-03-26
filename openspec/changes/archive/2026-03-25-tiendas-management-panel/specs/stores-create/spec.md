## ADDED Requirements

### Requirement: System SHALL provide form for creating new store
The system SHALL provide a comprehensive form with all required fields for creating a new third-party store including identity information, address, contact details, and configuration.

#### Scenario: Display create form with all sections
- **WHEN** user clicks "Nueva Tienda" button from stores list
- **THEN** system displays form with four sections: Identity Information, Address, Contact Details, and Configuration

#### Scenario: Form includes all identity fields
- **WHEN** create form is displayed
- **THEN** form includes fields for identity_number, name, legal_name, and identity_type dropdown with options NIT, RUT, CC, CE, RFC

#### Scenario: Form includes all address fields
- **WHEN** create form is displayed
- **THEN** form includes fields for line1, line2 (optional), city, state, postal_code, and country (2-letter code)

#### Scenario: Form includes all contact fields
- **WHEN** create form is displayed
- **THEN** form includes fields for contact_person_name, contact_person_email, and contact_phone_number

#### Scenario: Form includes all configuration fields
- **WHEN** create form is displayed
- **THEN** form includes discount_percentage, deduct_vat checkbox, and collection document config checkboxes (include_products_detail, include_unit_value, include_sku_in_detail, detail_in_appendix, include_legal_income_note)

### Requirement: System SHALL validate required fields
The system SHALL validate all required fields before submission and display clear error messages in Spanish.

#### Scenario: Submit with missing required fields
- **WHEN** user submits form with empty identity_number, name, legal_name, identity_type, address line1, city, state, postal_code, country, contact_person_name, or contact_person_email
- **THEN** system displays error message "Este campo es requerido" below each empty required field and prevents submission

#### Scenario: Submit with invalid email format
- **WHEN** user submits form with contact_person_email not matching email pattern
- **THEN** system displays error message "Formato de email inválido" below contact_person_email field and prevents submission

#### Scenario: Submit with invalid discount percentage
- **WHEN** user submits form with discount_percentage outside range 0-100
- **THEN** system displays error message "El descuento debe estar entre 0 y 100" and prevents submission

#### Scenario: Submit with invalid country code
- **WHEN** user submits form with country code not matching 2-letter ISO format
- **THEN** system displays error message "Código de país debe tener 2 letras" and prevents submission

### Requirement: System SHALL create store via API
The system SHALL submit validated form data to POST /stores endpoint and handle response.

#### Scenario: Successful store creation
- **WHEN** user submits valid form data
- **THEN** system sends POST request to /api/v1/stores, displays success message "Tienda creada exitosamente", and returns to stores list with new store visible

#### Scenario: Duplicate identity number error
- **WHEN** API returns 409 conflict error for duplicate identity_number
- **THEN** system displays error message "Ya existe una tienda con este número de identificación" near identity_number field

#### Scenario: Validation error from server
- **WHEN** API returns 400 validation error
- **THEN** system displays error message with validation details returned by server

#### Scenario: Authorization error
- **WHEN** user with analyst role attempts to create store and API returns 403 forbidden
- **THEN** system displays error message "No tienes permisos para crear tiendas"

### Requirement: System SHALL allow canceling form
The system SHALL provide a cancel button to return to stores list without saving.

#### Scenario: Cancel button click
- **WHEN** user clicks "Cancelar" button on create form
- **THEN** system returns to stores list without making API request

### Requirement: System SHALL show loading state during submission
The system SHALL disable form inputs and show loading indicator while API request is in progress.

#### Scenario: Form submission in progress
- **WHEN** user submits form and API request is pending
- **THEN** system disables all form inputs and submit button, displays loading spinner on submit button
