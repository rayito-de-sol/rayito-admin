## ADDED Requirements

### Requirement: User SHALL view list of all products

The products list page SHALL display all products with their key information including name, category, type, status, and current price.

#### Scenario: View products list
- **WHEN** user navigates to /productos
- **THEN** page displays all products in a grid or table layout

#### Scenario: Empty state
- **WHEN** no products exist
- **THEN** page displays "No hay productos registrados" message with "Crear Producto" button

#### Scenario: Loading state
- **WHEN** products are being fetched
- **THEN** page displays loading spinner with "Cargando productos..." message

### Requirement: User SHALL filter products by status

The products list page SHALL allow filtering products by status: all, draft, active, or inactive.

#### Scenario: Filter by active status
- **WHEN** user selects "Activo" status filter
- **THEN** only products with status "active" are displayed

#### Scenario: Filter by draft status
- **WHEN** user selects "Borrador" status filter
- **THEN** only products with status "draft" are displayed

#### Scenario: View all products
- **WHEN** user selects "Todos" status filter
- **THEN** all products regardless of status are displayed

### Requirement: User SHALL filter products by category

The products list page SHALL allow filtering products by category: set, turbante, cintillo, pinza, maximono, mono, diadema, otro.

#### Scenario: Filter by category
- **WHEN** user selects "Turbante" category filter
- **THEN** only products with category "turbante" are displayed

#### Scenario: View all categories
- **WHEN** user selects "Todas" category filter
- **THEN** all products regardless of category are displayed

### Requirement: User SHALL filter products by type

The products list page SHALL allow filtering products by type: single or set.

#### Scenario: Filter by single type
- **WHEN** user selects "Simple" type filter
- **THEN** only products with type "single" are displayed

#### Scenario: Filter by set type
- **WHEN** user selects "Set" type filter
- **THEN** only products with type "set" are displayed

### Requirement: User SHALL navigate to product detail

The products list page SHALL allow users to click on a product to view its detailed information.

#### Scenario: Click product card
- **WHEN** user clicks on a product card
- **THEN** product detail modal opens displaying full product information

### Requirement: User with edit permissions SHALL create new product

The products list page SHALL display a "Crear Producto" button for admin and manager roles that opens the product creation form.

#### Scenario: Admin creates product
- **WHEN** admin user clicks "Crear Producto" button
- **THEN** product creation modal opens

#### Scenario: Manager creates product
- **WHEN** manager user clicks "Crear Producto" button
- **THEN** product creation modal opens

#### Scenario: Analyst cannot create
- **WHEN** analyst user views products list page
- **THEN** "Crear Producto" button is not displayed

### Requirement: Product cards SHALL display key information

Each product card SHALL display name, category, type, status badge, and current price in Colombian pesos.

#### Scenario: Display product information
- **WHEN** product card is rendered
- **THEN** card shows product name, category label, type label, status badge, and formatted price

#### Scenario: Display set product badge
- **WHEN** product is type "set"
- **THEN** card displays "Set" badge

#### Scenario: Display draft status
- **WHEN** product status is "draft"
- **THEN** card displays "Borrador" badge in gray color

#### Scenario: Display active status
- **WHEN** product status is "active"
- **THEN** card displays "Activo" badge in green color

#### Scenario: Display inactive status
- **WHEN** product status is "inactive"
- **THEN** card displays "Inactivo" badge in red color
