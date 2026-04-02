## ADDED Requirements

### Requirement: User SHALL update product price

The price update form SHALL allow setting a new price amount for the product, creating a new price record and superseding the old one.

#### Scenario: Update price
- **WHEN** user enters new price and submits
- **THEN** new price record is created and marked as active

#### Scenario: Old price is superseded
- **WHEN** new price is created
- **THEN** previous price record is marked as superseded

### Requirement: User SHALL enter valid price

The price update form SHALL require non-negative price amount in Colombian pesos.

#### Scenario: Valid price
- **WHEN** user enters 75000 as new price
- **THEN** price is updated to 75000 COP

#### Scenario: Negative price rejected
- **WHEN** user enters -50 as new price
- **THEN** form displays "El precio debe ser mayor o igual a cero" error

#### Scenario: Zero price allowed
- **WHEN** user enters 0 as new price
- **THEN** price is updated to 0 COP

### Requirement: Form SHALL show current price

The price update form SHALL display the current active price for reference.

#### Scenario: Display current price
- **WHEN** price update form opens
- **THEN** form shows "Precio actual: $XX,XXX COP" label

### Requirement: Form SHALL handle update success

The price update form SHALL close and refresh product detail upon successful price update.

#### Scenario: Successful price update
- **WHEN** price is updated successfully
- **THEN** form closes and success message "Precio actualizado exitosamente" is displayed

#### Scenario: Product detail refreshes
- **WHEN** price is updated successfully
- **THEN** product detail view shows new price

### Requirement: Form SHALL handle update errors

The price update form SHALL display error messages for failed price update attempts.

#### Scenario: Product not found
- **WHEN** API returns 404 with PRODUCT_NOT_FOUND error
- **THEN** form displays "Producto no encontrado" error

#### Scenario: Network error
- **WHEN** update request fails due to network issue
- **THEN** form displays "Error de conexión. Verifique su red e intente nuevamente" error
