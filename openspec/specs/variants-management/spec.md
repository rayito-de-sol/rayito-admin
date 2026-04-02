## ADDED Requirements

### Requirement: User SHALL create variant with required fields

The variant creation form SHALL require color, size, SKU, initial stock, and initial cost.

#### Scenario: Create variant with minimum fields
- **WHEN** user submits form with all required fields
- **THEN** variant is created successfully

#### Scenario: Missing color
- **WHEN** user submits form without color
- **THEN** form displays "El color es requerido" error

#### Scenario: Missing size
- **WHEN** user submits form without size selection
- **THEN** form displays "La talla es requerida" error

#### Scenario: Missing SKU
- **WHEN** user submits form without SKU
- **THEN** form displays "El SKU es requerido" error

### Requirement: User SHALL select size from product sizes

The variant creation form SHALL display a dropdown with sizes defined for the product.

#### Scenario: Size dropdown loads product sizes
- **WHEN** form opens
- **THEN** size dropdown is populated with product's sizes

#### Scenario: No sizes available
- **WHEN** product has no sizes defined
- **THEN** form displays "Primero debe crear una talla para este producto" message

### Requirement: User SHALL set initial stock and cost

The variant creation form SHALL require non-negative initial stock quantity and cost amount.

#### Scenario: Valid stock and cost
- **WHEN** user enters stock 100 and cost 5000
- **THEN** variant is created with stock 100 and cost 5000 COP

#### Scenario: Negative stock rejected
- **WHEN** user enters -10 as stock
- **THEN** form displays "El stock debe ser mayor o igual a cero" error

#### Scenario: Negative cost rejected
- **WHEN** user enters -100 as cost
- **THEN** form displays "El costo debe ser mayor o igual a cero" error

### Requirement: User SHALL add variant images

The variant creation form SHALL allow adding multiple image URLs with alt text and marking one as primary.

#### Scenario: Add image with URL
- **WHEN** user enters image URL and alt text
- **THEN** image is added to variant images array

#### Scenario: Add multiple images
- **WHEN** user adds multiple images
- **THEN** all images are saved in images array

#### Scenario: Mark primary image
- **WHEN** user marks an image as primary
- **THEN** that image's is_primary field is set to true

#### Scenario: Only one primary image
- **WHEN** user marks a second image as primary
- **THEN** previous primary image is_primary is set to false

#### Scenario: First image is primary by default
- **WHEN** user adds first image
- **THEN** image is automatically marked as primary

### Requirement: User SHALL view variant in product detail

The variant SHALL be displayed in product detail view with color, size, SKU, stock, cost, and primary image.

#### Scenario: Variant card displays information
- **WHEN** variant is rendered in product detail
- **THEN** card shows color, size label, SKU, stock quantity, and formatted cost

#### Scenario: Variant displays primary image
- **WHEN** variant has images
- **THEN** card shows primary image thumbnail

#### Scenario: Variant without image
- **WHEN** variant has no images
- **THEN** card shows placeholder image

### Requirement: User with edit permissions SHALL update variant stock

The variant card SHALL display a stock update button for admin and manager roles.

#### Scenario: Update stock
- **WHEN** admin user clicks "Actualizar Stock" button
- **THEN** stock update form opens

#### Scenario: Successful stock update
- **WHEN** user enters new stock amount and submits
- **THEN** variant stock is updated and card refreshes

#### Scenario: Analyst cannot update stock
- **WHEN** analyst user views variant
- **THEN** "Actualizar Stock" button is not displayed

### Requirement: User with edit permissions SHALL update variant cost

The variant card SHALL display a cost update button for admin and manager roles that creates a new cost record.

#### Scenario: Update cost
- **WHEN** admin user clicks "Actualizar Costo" button
- **THEN** cost update form opens

#### Scenario: Successful cost update
- **WHEN** user enters new cost amount and submits
- **THEN** new cost record is created and variant card refreshes

#### Scenario: Old cost is superseded
- **WHEN** new cost is created
- **THEN** previous cost record is marked as superseded

#### Scenario: Analyst cannot update cost
- **WHEN** analyst user views variant
- **THEN** "Actualizar Costo" button is not displayed

### Requirement: User SHALL view variant images

The variant card SHALL allow clicking to view all images in a gallery.

#### Scenario: Open image gallery
- **WHEN** user clicks on variant image thumbnail
- **THEN** image gallery modal opens showing all variant images

#### Scenario: Navigate images
- **WHEN** gallery modal is open
- **THEN** user can navigate through images with prev/next buttons

### Requirement: Form SHALL handle creation success

The variant creation form SHALL close and refresh product detail upon successful creation.

#### Scenario: Successful creation
- **WHEN** variant is created successfully
- **THEN** form closes and success message "Variante creada exitosamente" is displayed

#### Scenario: Product detail refreshes
- **WHEN** variant is created successfully
- **THEN** product detail view refreshes to show new variant

### Requirement: Form SHALL handle creation errors

The variant creation form SHALL display error messages for failed creation attempts.

#### Scenario: Duplicate SKU error
- **WHEN** API returns 409 with DUPLICATE_SKU error
- **THEN** form displays "Ya existe una variante con este SKU" error

#### Scenario: Product not found
- **WHEN** API returns 404 with PRODUCT_NOT_FOUND error
- **THEN** form displays "Producto no encontrado" error
