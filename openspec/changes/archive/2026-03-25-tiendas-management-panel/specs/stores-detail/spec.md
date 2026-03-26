## ADDED Requirements

### Requirement: System SHALL display complete store information
The system SHALL display all store fields in a read-only view organized by logical sections matching the form structure.

#### Scenario: Display store details with all sections
- **WHEN** user clicks on a store from the stores list
- **THEN** system displays store details view with sections: Identity Information, Address, Contact Details, and Configuration

#### Scenario: Display identity information
- **WHEN** store details view is shown
- **THEN** system displays identity_number, name, legal_name, and identity_type in Identity Information section

#### Scenario: Display address information
- **WHEN** store details view is shown
- **THEN** system displays formatted address including line1, line2, city, state, postal_code, and country in Address section

#### Scenario: Display contact information
- **WHEN** store details view is shown
- **THEN** system displays contact_person_name, contact_person_email, and contact_phone_number in Contact Details section

#### Scenario: Display configuration information
- **WHEN** store details view is shown
- **THEN** system displays discount_percentage, deduct_vat status, and all collection document configuration flags (include_products_detail, include_unit_value, include_sku_in_detail, detail_in_appendix, include_legal_income_note) in Configuration section

### Requirement: System SHALL provide action buttons
The system SHALL provide buttons to edit the store or return to the stores list.

#### Scenario: Edit button click
- **WHEN** user clicks "Editar" button on store details view
- **THEN** system displays edit form pre-filled with current store data

#### Scenario: Back button click
- **WHEN** user clicks "Volver" button on store details view
- **THEN** system returns to stores list

### Requirement: System SHALL handle store not found error
The system SHALL display error message when requested store does not exist.

#### Scenario: Store not found
- **WHEN** GET /stores/:id API returns 404 not found error
- **THEN** system displays error message "Tienda no encontrada" and provides button to return to stores list

### Requirement: System SHALL show loading state while fetching
The system SHALL display loading indicator while fetching store details from API.

#### Scenario: Loading store details
- **WHEN** user selects a store and API request is in progress
- **THEN** system displays loading spinner until store data is fetched
