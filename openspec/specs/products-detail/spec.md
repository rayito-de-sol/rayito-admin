## ADDED Requirements

### Requirement: User SHALL view complete product information

The product detail view SHALL display all product information including name, slug, description, SKU prefix, category, tags, type, status, current price, and associated package.

#### Scenario: View product details
- **WHEN** user opens product detail modal
- **THEN** modal displays all product fields

#### Scenario: View product with package
- **WHEN** product has an associated package
- **THEN** modal displays package name and current package cost

#### Scenario: View product without package
- **WHEN** product has no associated package
- **THEN** modal displays "Sin empaque" label

### Requirement: User SHALL view product variants

The product detail view SHALL display all variants for the product with their color, size, SKU, stock level, current cost, and images.

#### Scenario: View variants list
- **WHEN** product has variants
- **THEN** modal displays variants section with all variant cards

#### Scenario: No variants exist
- **WHEN** product has no variants
- **THEN** modal displays "No hay variantes creadas" message

#### Scenario: View variant images
- **WHEN** variant has images
- **THEN** variant card displays primary image thumbnail

### Requirement: User SHALL view product sizes

The product detail view SHALL display all sizes defined for the product.

#### Scenario: View sizes list
- **WHEN** product has sizes
- **THEN** modal displays sizes section with size labels

#### Scenario: No sizes exist
- **WHEN** product has no sizes
- **THEN** modal displays "No hay tallas creadas" message

### Requirement: User SHALL view price history

The product detail view SHALL allow users to view the product's price history including all price changes, dates, and superseded records.

#### Scenario: View price history
- **WHEN** user clicks "Ver historial de precios" button
- **THEN** price history modal opens displaying all price records

### Requirement: User with edit permissions SHALL edit product

The product detail view SHALL display an "Editar" button for admin and manager roles that opens the product edit form.

#### Scenario: Admin edits product
- **WHEN** admin user clicks "Editar" button
- **THEN** product edit modal opens with pre-filled form

#### Scenario: Manager edits product
- **WHEN** manager user clicks "Editar" button
- **THEN** product edit modal opens with pre-filled form

#### Scenario: Analyst cannot edit
- **WHEN** analyst user views product detail
- **THEN** "Editar" button is not displayed

### Requirement: User with edit permissions SHALL update product price

The product detail view SHALL display an "Actualizar Precio" button for admin and manager roles that opens the price update form.

#### Scenario: Update price
- **WHEN** admin user clicks "Actualizar Precio" button
- **THEN** price update form opens

#### Scenario: Successful price update
- **WHEN** user submits valid price
- **THEN** new price record is created and product detail refreshes

### Requirement: User with edit permissions SHALL add variant

The product detail view SHALL display an "Agregar Variante" button for admin and manager roles that opens the variant creation form.

#### Scenario: Add variant
- **WHEN** admin user clicks "Agregar Variante" button
- **THEN** variant creation form opens

#### Scenario: Analyst cannot add variant
- **WHEN** analyst user views product detail
- **THEN** "Agregar Variante" button is not displayed

### Requirement: User with edit permissions SHALL add size

The product detail view SHALL display an "Agregar Talla" button for admin and manager roles that opens the size creation form.

#### Scenario: Add size
- **WHEN** admin user clicks "Agregar Talla" button
- **THEN** size creation form opens

#### Scenario: Analyst cannot add size
- **WHEN** analyst user views product detail
- **THEN** "Agregar Talla" button is not displayed

### Requirement: User SHALL view set product composition

For set products, the product detail view SHALL display the set composition showing all component variants with quantities, computed total cost, and computed available stock.

#### Scenario: View set composition
- **WHEN** product type is "set"
- **THEN** modal displays set composition section

#### Scenario: View computed set cost
- **WHEN** set product has component variants
- **THEN** modal displays computed total cost: SUM(variant_quantity × variant_cost) + package_cost

#### Scenario: View computed set stock
- **WHEN** set product has component variants
- **THEN** modal displays computed available stock: MIN(variant_stock / variant_quantity)

#### Scenario: Single product hides composition
- **WHEN** product type is "single"
- **THEN** set composition section is not displayed

### Requirement: User with edit permissions SHALL manage set composition

For set products, the product detail view SHALL allow admin and manager roles to add or remove component variants.

#### Scenario: Add component variant
- **WHEN** admin user clicks "Agregar Componente" button
- **THEN** component selection form opens

#### Scenario: Remove component variant
- **WHEN** admin user clicks remove icon on component
- **THEN** confirmation dialog appears

#### Scenario: Analyst cannot modify composition
- **WHEN** analyst user views set product
- **THEN** composition management buttons are not displayed
