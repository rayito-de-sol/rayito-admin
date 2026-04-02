## ADDED Requirements

### Requirement: User SHALL create product with required fields

The product creation form SHALL require name, slug, SKU prefix, category, type, and initial price.

#### Scenario: Create product with minimum fields
- **WHEN** user submits form with all required fields
- **THEN** product is created successfully

#### Scenario: Missing required field
- **WHEN** user submits form without name
- **THEN** form displays "El nombre es requerido" error

#### Scenario: Missing slug
- **WHEN** user submits form without slug
- **THEN** form displays "El slug es requerido" error

#### Scenario: Missing SKU prefix
- **WHEN** user submits form without SKU prefix
- **THEN** form displays "El prefijo SKU es requerido" error

#### Scenario: Missing initial price
- **WHEN** user submits form without initial price
- **THEN** form displays "El precio inicial es requerido" error

### Requirement: User SHALL create product with optional fields

The product creation form SHALL allow optional description, tags, and package selection.

#### Scenario: Create product with description
- **WHEN** user provides description text
- **THEN** product is created with the description

#### Scenario: Create product with tags
- **WHEN** user provides comma-separated tags
- **THEN** product is created with tags array

#### Scenario: Create product without optional fields
- **WHEN** user submits form without description or tags
- **THEN** product is created successfully

### Requirement: User SHALL select product category

The product creation form SHALL provide a dropdown with categories: set, turbante, cintillo, pinza, maximono, mono, diadema, otro.

#### Scenario: Select category
- **WHEN** user selects "turbante" from category dropdown
- **THEN** product is created with category "turbante"

### Requirement: User SHALL select product type

The product creation form SHALL provide a dropdown with types: single or set.

#### Scenario: Create single product
- **WHEN** user selects "Simple" type
- **THEN** product is created with type "single"

#### Scenario: Create set product
- **WHEN** user selects "Set" type
- **THEN** product is created with type "set"

### Requirement: User SHALL select optional package

The product creation form SHALL load all available packages and provide a dropdown with "Sin empaque" option.

#### Scenario: Create product with package
- **WHEN** user selects a package from dropdown
- **THEN** product is created with package_id set to selected package

#### Scenario: Create product without package
- **WHEN** user selects "Sin empaque" option
- **THEN** product is created with package_id set to null

#### Scenario: Package dropdown loads packages
- **WHEN** form opens
- **THEN** packages are fetched from GET /packages and displayed in dropdown

### Requirement: User SHALL set initial price

The product creation form SHALL require initial price in Colombian pesos as a non-negative number.

#### Scenario: Valid initial price
- **WHEN** user enters 50000 as initial price
- **THEN** product is created with initial price of 50000 COP

#### Scenario: Negative price rejected
- **WHEN** user enters -100 as initial price
- **THEN** form displays "El precio debe ser mayor o igual a cero" error

### Requirement: User SHALL see validation errors

The product creation form SHALL display inline validation errors for invalid fields.

#### Scenario: Empty required field
- **WHEN** user leaves name field empty and clicks submit
- **THEN** name field displays red border and error message

#### Scenario: Invalid slug format
- **WHEN** user enters "Invalid Slug!" with spaces and special characters
- **THEN** form displays "El slug debe contener solo letras, números y guiones" error

### Requirement: Form SHALL handle creation success

The product creation form SHALL close and refresh the products list upon successful creation.

#### Scenario: Successful creation
- **WHEN** product is created successfully
- **THEN** form modal closes and success message "Producto creado exitosamente" is displayed

#### Scenario: List refreshes
- **WHEN** product is created successfully
- **THEN** products list page refreshes to show new product

### Requirement: Form SHALL handle creation errors

The product creation form SHALL display error messages for failed creation attempts.

#### Scenario: Duplicate slug error
- **WHEN** API returns 409 with DUPLICATE_SLUG error
- **THEN** form displays "Ya existe un producto con este slug" error

#### Scenario: Network error
- **WHEN** creation request fails due to network issue
- **THEN** form displays "Error de conexión. Verifique su red e intente nuevamente" error

### Requirement: Form SHALL show loading state

The product creation form SHALL disable submit button and show loading indicator during creation.

#### Scenario: Loading state during creation
- **WHEN** user clicks "Crear" button
- **THEN** button is disabled and shows "Creando..." text with spinner

#### Scenario: Form re-enables after error
- **WHEN** creation fails
- **THEN** submit button is re-enabled for retry
