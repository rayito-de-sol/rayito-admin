## ADDED Requirements

### Requirement: User SHALL edit product information

The product edit form SHALL allow editing name, slug, description, category, tags, status, and package association.

#### Scenario: Edit product name
- **WHEN** user updates product name and submits
- **THEN** product is updated with new name

#### Scenario: Edit product description
- **WHEN** user updates description text
- **THEN** product is updated with new description

#### Scenario: Change product category
- **WHEN** user selects different category from dropdown
- **THEN** product is updated with new category

#### Scenario: Change product status
- **WHEN** user selects different status (draft/active/inactive)
- **THEN** product is updated with new status

### Requirement: User SHALL change product package

The product edit form SHALL allow changing the associated package or removing package association.

#### Scenario: Associate package
- **WHEN** user selects a package from dropdown
- **THEN** product is updated with new package_id

#### Scenario: Remove package
- **WHEN** user selects "Sin empaque" option
- **THEN** product is updated with package_id set to null

#### Scenario: Change existing package
- **WHEN** user changes from one package to another
- **THEN** product is updated with new package_id

### Requirement: User SHALL NOT edit product type

The product edit form SHALL NOT allow changing product type (single/set) after creation.

#### Scenario: Type field is disabled
- **WHEN** edit form is displayed
- **THEN** type field shows current type but is disabled

### Requirement: Form SHALL pre-fill current values

The product edit form SHALL load and display current product values when opened.

#### Scenario: Form loads current data
- **WHEN** edit form opens
- **THEN** all fields are pre-filled with current product values

#### Scenario: Current package is selected
- **WHEN** product has associated package
- **THEN** package dropdown shows current package selected

### Requirement: Form SHALL validate edited fields

The product edit form SHALL validate all edited fields with same rules as creation form.

#### Scenario: Invalid slug format
- **WHEN** user enters invalid slug
- **THEN** form displays "El slug debe contener solo letras, números y guiones" error

#### Scenario: Empty required field
- **WHEN** user clears name field
- **THEN** form displays "El nombre es requerido" error

### Requirement: Form SHALL handle update success

The product edit form SHALL close and refresh product detail upon successful update.

#### Scenario: Successful update
- **WHEN** product is updated successfully
- **THEN** edit form closes and success message "Producto actualizado exitosamente" is displayed

#### Scenario: Detail view refreshes
- **WHEN** product is updated successfully
- **THEN** product detail view refreshes to show updated information

### Requirement: Form SHALL handle update errors

The product edit form SHALL display error messages for failed update attempts.

#### Scenario: Duplicate slug error
- **WHEN** API returns 409 with DUPLICATE_SLUG error
- **THEN** form displays "Ya existe un producto con este slug" error

#### Scenario: Product not found
- **WHEN** API returns 404 with PRODUCT_NOT_FOUND error
- **THEN** form displays "Producto no encontrado" error and closes
