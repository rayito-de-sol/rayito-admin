## ADDED Requirements

### Requirement: User SHALL create package with required fields

The package creation form SHALL require name and initial cost. Description is optional.

#### Scenario: Create package with minimum fields
- **WHEN** user submits form with name and initial cost
- **THEN** package is created successfully

#### Scenario: Missing name
- **WHEN** user submits form without name
- **THEN** form displays "El nombre es requerido" error

#### Scenario: Missing initial cost
- **WHEN** user submits form without initial cost
- **THEN** form displays "El costo inicial es requerido" error

### Requirement: User SHALL create package with optional description

The package creation form SHALL allow optional description text.

#### Scenario: Create package with description
- **WHEN** user provides description text
- **THEN** package is created with the description

#### Scenario: Create package without description
- **WHEN** user submits form without description
- **THEN** package is created successfully with empty description

### Requirement: User SHALL set initial cost

The package creation form SHALL require non-negative initial cost in Colombian pesos.

#### Scenario: Valid initial cost
- **WHEN** user enters 3000 as initial cost
- **THEN** package is created with initial cost of 3000 COP

#### Scenario: Negative cost rejected
- **WHEN** user enters -50 as initial cost
- **THEN** form displays "El costo debe ser mayor o igual a cero" error

#### Scenario: Zero cost allowed
- **WHEN** user enters 0 as initial cost
- **THEN** package is created with cost 0 COP

### Requirement: Form SHALL handle creation success

The package creation form SHALL close and refresh packages list upon successful creation.

#### Scenario: Successful creation
- **WHEN** package is created successfully
- **THEN** form closes and success message "Empaque creado exitosamente" is displayed

#### Scenario: List refreshes
- **WHEN** package is created successfully
- **THEN** packages list page refreshes to show new package

### Requirement: Form SHALL handle creation errors

The package creation form SHALL display error messages for failed creation attempts.

#### Scenario: Duplicate name error
- **WHEN** API returns 409 with DUPLICATE_PACKAGE_NAME error
- **THEN** form displays "Ya existe un empaque con este nombre" error

#### Scenario: Network error
- **WHEN** creation request fails due to network issue
- **THEN** form displays "Error de conexión. Verifique su red e intente nuevamente" error

### Requirement: Form SHALL show loading state

The package creation form SHALL disable submit button and show loading indicator during creation.

#### Scenario: Loading state during creation
- **WHEN** user clicks "Crear" button
- **THEN** button is disabled and shows "Creando..." text with spinner
