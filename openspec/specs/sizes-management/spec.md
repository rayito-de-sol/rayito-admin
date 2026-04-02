## ADDED Requirements

### Requirement: User SHALL create product-specific size

The size creation form SHALL require a label for the size and associate it with the current product.

#### Scenario: Create size with label
- **WHEN** user enters label "Niña" and submits
- **THEN** size is created with label "Niña" for the product

#### Scenario: Missing label
- **WHEN** user submits form without label
- **THEN** form displays "La etiqueta es requerida" error

### Requirement: Size labels SHALL be unique per product

The system SHALL enforce that each size label is unique within a product.

#### Scenario: Duplicate size label
- **WHEN** user creates size with label that already exists for product
- **THEN** API returns 409 error and form displays "Ya existe una talla con esta etiqueta para este producto" error

#### Scenario: Same label in different products allowed
- **WHEN** user creates size "Niña" for Product A and "Niña" for Product B
- **THEN** both sizes are created successfully

### Requirement: User SHALL view sizes in product detail

The product detail view SHALL display all sizes defined for the product.

#### Scenario: Display sizes list
- **WHEN** product has sizes
- **THEN** sizes section shows all size labels

#### Scenario: No sizes message
- **WHEN** product has no sizes
- **THEN** sizes section displays "No hay tallas creadas" message

### Requirement: Form SHALL handle creation success

The size creation form SHALL close and refresh product detail upon successful creation.

#### Scenario: Successful creation
- **WHEN** size is created successfully
- **THEN** form closes and success message "Talla creada exitosamente" is displayed

#### Scenario: Product detail refreshes
- **WHEN** size is created successfully
- **THEN** product detail view refreshes to show new size

### Requirement: Form SHALL handle creation errors

The size creation form SHALL display error messages for failed creation attempts.

#### Scenario: Duplicate label error
- **WHEN** API returns 409 with DUPLICATE_SIZE_LABEL error
- **THEN** form displays "Ya existe una talla con esta etiqueta para este producto" error

#### Scenario: Product not found
- **WHEN** API returns 404 with PRODUCT_NOT_FOUND error
- **THEN** form displays "Producto no encontrado" error
