## ADDED Requirements

### Requirement: User SHALL view package cost history

The package cost history view SHALL display all cost records for the package including amount, effective date, and superseded status.

#### Scenario: View cost history
- **WHEN** user clicks "Ver historial de costos" button on package card
- **THEN** cost history modal opens

#### Scenario: Display all cost records
- **WHEN** cost history modal is open
- **THEN** modal displays all cost records sorted by effective date (newest first)

#### Scenario: Display active cost
- **WHEN** cost record is active (not superseded)
- **THEN** record displays "Activo" badge in green

#### Scenario: Display superseded cost
- **WHEN** cost record is superseded
- **THEN** record displays "Reemplazado" badge in gray with superseded date

### Requirement: Cost records SHALL show formatted information

Each cost record SHALL display cost amount in COP, effective date in Spanish format, and superseded status.

#### Scenario: Format cost amount
- **WHEN** cost record is displayed
- **THEN** amount is formatted as "$X,XXX COP"

#### Scenario: Format effective date
- **WHEN** cost record is displayed
- **THEN** effective date is formatted as "DD/MM/YYYY HH:mm"

#### Scenario: Show superseded date
- **WHEN** cost record is superseded
- **THEN** modal shows "Reemplazado el: DD/MM/YYYY HH:mm"

### Requirement: Modal SHALL handle empty history

The cost history modal SHALL display appropriate message when no history exists.

#### Scenario: No cost history
- **WHEN** package has only current cost
- **THEN** modal displays "Solo existe el costo actual" message

### Requirement: Modal SHALL handle loading and errors

The cost history modal SHALL display loading state while fetching and error messages on failure.

#### Scenario: Loading state
- **WHEN** cost history is being fetched
- **THEN** modal displays loading spinner

#### Scenario: Fetch error
- **WHEN** cost history fetch fails
- **THEN** modal displays "Error al cargar el historial de costos" message
