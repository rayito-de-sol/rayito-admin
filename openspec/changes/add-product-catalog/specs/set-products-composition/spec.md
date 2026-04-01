## ADDED Requirements

### Requirement: User SHALL view set product composition

For set products, the product detail view SHALL display all component variants with their quantities.

#### Scenario: View composition
- **WHEN** user views detail of a set product
- **THEN** modal displays set composition section with all component variants

#### Scenario: Single product hides composition
- **WHEN** product type is "single"
- **THEN** set composition section is not displayed

### Requirement: Component variants SHALL show key information

Each component variant in the composition SHALL display variant name, color, size, SKU, quantity, current cost, and line total (quantity × cost).

#### Scenario: Display component information
- **WHEN** component variant is rendered
- **THEN** shows variant name, color, size, quantity, unit cost, and line total

#### Scenario: Calculate line total
- **WHEN** component has quantity 2 and cost 5000 COP
- **THEN** displays "Subtotal: $10,000 COP"

### Requirement: User SHALL view computed set cost

The set product detail SHALL display computed total cost calculated as SUM(variant_quantity × variant_cost) + package_cost.

#### Scenario: Compute set cost with package
- **WHEN** set has 2 variants (qty 1 @ 5000, qty 2 @ 3000) and package cost 1000
- **THEN** displays "Costo Total: $12,000 COP" (5000 + 6000 + 1000)

#### Scenario: Compute set cost without package
- **WHEN** set has 2 variants (qty 1 @ 5000, qty 2 @ 3000) and no package
- **THEN** displays "Costo Total: $11,000 COP" (5000 + 6000)

#### Scenario: Cost breakdown
- **WHEN** set cost is displayed
- **THEN** shows breakdown: "Componentes: $XX,XXX" + "Empaque: $X,XXX" = "Total: $XX,XXX"

### Requirement: User SHALL view computed set stock

The set product detail SHALL display computed available stock calculated as MIN(variant_stock / variant_quantity) for all components.

#### Scenario: Compute set stock
- **WHEN** set has component A (stock 100, qty 2) and component B (stock 50, qty 1)
- **THEN** displays "Stock Disponible: 50 unidades" (min of 100/2=50, 50/1=50)

#### Scenario: Limiting component
- **WHEN** set has component A (stock 20, qty 1) and component B (stock 100, qty 2)
- **THEN** displays "Stock Disponible: 20 unidades" (min of 20/1=20, 100/2=50)

#### Scenario: Zero stock component
- **WHEN** any component has stock 0
- **THEN** displays "Stock Disponible: 0 unidades"

### Requirement: User with edit permissions SHALL add component variant

The set composition section SHALL display "Agregar Componente" button for admin and manager roles.

#### Scenario: Add component
- **WHEN** admin user clicks "Agregar Componente" button
- **THEN** component selection form opens

#### Scenario: Select variant and quantity
- **WHEN** user selects a variant and enters quantity
- **THEN** variant is added to set composition with specified quantity

#### Scenario: Analyst cannot add component
- **WHEN** analyst user views set product
- **THEN** "Agregar Componente" button is not displayed

### Requirement: User with edit permissions SHALL remove component variant

Each component in the composition SHALL display a remove button for admin and manager roles.

#### Scenario: Remove component
- **WHEN** admin user clicks remove icon on component
- **THEN** confirmation dialog "¿Está seguro de eliminar este componente?" appears

#### Scenario: Confirm removal
- **WHEN** user confirms removal
- **THEN** component is removed and composition refreshes

#### Scenario: Analyst cannot remove component
- **WHEN** analyst user views set product
- **THEN** remove buttons are not displayed

### Requirement: Set composition SHALL validate at least one component

A set product MUST have at least one component variant.

#### Scenario: Cannot remove last component
- **WHEN** set has only one component and user tries to remove it
- **THEN** error message "Un set debe tener al menos un componente" is displayed

### Requirement: Component form SHALL prevent duplicate variants

The component selection form SHALL not allow adding the same variant twice to a set.

#### Scenario: Duplicate variant rejected
- **WHEN** user tries to add a variant already in the composition
- **THEN** form displays "Esta variante ya está en el set" error

### Requirement: Composition SHALL update computed values

When components are added or removed, the set cost and stock SHALL recalculate automatically.

#### Scenario: Add component updates cost
- **WHEN** user adds a new component
- **THEN** set cost increases by (component_quantity × component_cost)

#### Scenario: Remove component updates cost
- **WHEN** user removes a component
- **THEN** set cost decreases by (component_quantity × component_cost)

#### Scenario: Add component updates stock
- **WHEN** user adds a component with low stock
- **THEN** set available stock may decrease if new component is limiting factor

### Requirement: Form SHALL handle composition errors

The component management SHALL display error messages for failed operations.

#### Scenario: Variant not found
- **WHEN** API returns 404 with VARIANT_NOT_FOUND error
- **THEN** form displays "Variante no encontrada" error

#### Scenario: Invalid quantity
- **WHEN** API returns 400 with INVALID_QUANTITY error
- **THEN** form displays "La cantidad debe ser mayor a cero" error
