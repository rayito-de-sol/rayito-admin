## ADDED Requirements

### Requirement: User SHALL view list of all packages

The packages list page SHALL display all reusable packages with their name, description, current cost, and usage information.

#### Scenario: View packages list
- **WHEN** user navigates to /empaques
- **THEN** page displays all packages

#### Scenario: Empty state
- **WHEN** no packages exist
- **THEN** page displays "No hay empaques registrados" message with "Crear Empaque" button

#### Scenario: Loading state
- **WHEN** packages are being fetched
- **THEN** page displays loading spinner with "Cargando empaques..." message

### Requirement: User with edit permissions SHALL create new package

The packages list page SHALL display a "Crear Empaque" button for admin and manager roles that opens the package creation form.

#### Scenario: Admin creates package
- **WHEN** admin user clicks "Crear Empaque" button
- **THEN** package creation form opens

#### Scenario: Manager creates package
- **WHEN** manager user clicks "Crear Empaque" button
- **THEN** package creation form opens

#### Scenario: Analyst cannot create
- **WHEN** analyst user views packages list page
- **THEN** "Crear Empaque" button is not displayed

### Requirement: Package cards SHALL display key information

Each package card SHALL display name, description, current cost, and number of products using the package.

#### Scenario: Display package information
- **WHEN** package card is rendered
- **THEN** card shows package name, description, formatted cost, and usage count

#### Scenario: Display usage count
- **WHEN** package is used by 3 products
- **THEN** card shows "Usado en 3 productos"

#### Scenario: No usage
- **WHEN** package is not used by any product
- **THEN** card shows "No está en uso"

### Requirement: User with edit permissions SHALL edit package

Each package card SHALL display "Editar" button for admin and manager roles.

#### Scenario: Admin edits package
- **WHEN** admin user clicks "Editar" button
- **THEN** package edit modal opens

#### Scenario: Analyst cannot edit
- **WHEN** analyst user views package card
- **THEN** "Editar" button is not displayed

### Requirement: User SHALL view which products use package

Each package card SHALL allow viewing the list of products using the package.

#### Scenario: View products using package
- **WHEN** user clicks on usage count link
- **THEN** modal opens showing list of product names using the package

#### Scenario: No products use package
- **WHEN** package is not used
- **THEN** usage count is not clickable
