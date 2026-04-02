## ADDED Requirements

### Requirement: User SHALL edit package information

The package edit form SHALL allow editing name and description.

#### Scenario: Edit package name
- **WHEN** user updates package name and submits
- **THEN** package is updated with new name

#### Scenario: Edit package description
- **WHEN** user updates description text and submits
- **THEN** package is updated with new description

### Requirement: User with edit permissions SHALL update package cost

The package card SHALL display "Actualizar Costo" button for admin and manager roles that creates a new cost record.

#### Scenario: Update cost
- **WHEN** admin user clicks "Actualizar Costo" button
- **THEN** cost update form opens

#### Scenario: Successful cost update
- **WHEN** user enters new cost amount and submits
- **THEN** new cost record is created and package card refreshes

#### Scenario: Old cost is superseded
- **WHEN** new cost is created
- **THEN** previous cost record is marked as superseded

#### Scenario: Analyst cannot update cost
- **WHEN** analyst user views package
- **THEN** "Actualizar Costo" button is not displayed

### Requirement: User SHALL view package cost history

The package card SHALL display "Ver historial de costos" button that opens cost history modal.

#### Scenario: View cost history
- **WHEN** user clicks "Ver historial de costos" button
- **THEN** cost history modal opens displaying all cost records

### Requirement: Cost update form SHALL validate cost

The cost update form SHALL require non-negative cost amount in Colombian pesos.

#### Scenario: Valid cost
- **WHEN** user enters 5000 as new cost
- **THEN** cost is updated to 5000 COP

#### Scenario: Negative cost rejected
- **WHEN** user enters -100 as new cost
- **THEN** form displays "El costo debe ser mayor o igual a cero" error

### Requirement: Form SHALL pre-fill current values

The package edit form SHALL load and display current package values when opened.

#### Scenario: Form loads current data
- **WHEN** edit form opens
- **THEN** all fields are pre-filled with current package values

### Requirement: Cost update form SHALL show current cost

The cost update form SHALL display the current active cost for reference.

#### Scenario: Display current cost
- **WHEN** cost update form opens
- **THEN** form shows "Costo actual: $X,XXX COP" label

### Requirement: Form SHALL handle update success

The package edit form SHALL close and refresh packages list upon successful update.

#### Scenario: Successful update
- **WHEN** package is updated successfully
- **THEN** form closes and success message "Empaque actualizado exitosamente" is displayed

#### Scenario: List refreshes
- **WHEN** package is updated successfully
- **THEN** packages list page refreshes to show updated information

### Requirement: Form SHALL handle update errors

The package edit form SHALL display error messages for failed update attempts.

#### Scenario: Duplicate name error
- **WHEN** API returns 409 with DUPLICATE_PACKAGE_NAME error
- **THEN** form displays "Ya existe un empaque con este nombre" error

#### Scenario: Package not found
- **WHEN** API returns 404 with PACKAGE_NOT_FOUND error
- **THEN** form displays "Empaque no encontrado" error

#### Scenario: Package in use cannot be deleted
- **WHEN** API returns 409 with PACKAGE_IN_USE error
- **THEN** form displays "No se puede eliminar el empaque porque está en uso por uno o más productos" error
