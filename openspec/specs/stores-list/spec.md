## ADDED Requirements

### Requirement: System SHALL display all stores in a table
The system SHALL display all third-party stores in a table format showing key information including identity number, name, contact details, and discount percentage.

#### Scenario: Successful stores list display
- **WHEN** authenticated user navigates to /tiendas route
- **THEN** system displays table with all stores showing identity_number, name, contact_person_name, contact_phone_number, and discount_percentage columns

#### Scenario: Empty stores list
- **WHEN** authenticated user navigates to /tiendas and no stores exist
- **THEN** system displays empty state message "No hay tiendas registradas"

#### Scenario: Stores list loading state
- **WHEN** authenticated user navigates to /tiendas and API request is in progress
- **THEN** system displays loading spinner until data is fetched

### Requirement: System SHALL allow navigation to create store form
The system SHALL provide a button to navigate to the create store form from the stores list view.

#### Scenario: Create button click
- **WHEN** user clicks "Nueva Tienda" button
- **THEN** system displays store creation form

### Requirement: System SHALL allow navigation to store details
The system SHALL allow users to click on a store row to view complete store details.

#### Scenario: Store row click
- **WHEN** user clicks on a store row in the table
- **THEN** system displays detailed view of selected store with all fields

### Requirement: System SHALL handle API errors gracefully
The system SHALL display error messages when API requests fail.

#### Scenario: List stores API error
- **WHEN** GET /stores API request fails with server error
- **THEN** system displays error message "Error al cargar las tiendas" and allows retry

#### Scenario: List stores authentication error
- **WHEN** GET /stores API request fails with 401 unauthorized
- **THEN** system redirects to login page
