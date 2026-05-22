# Spec: Collection List View

## ADDED Requirements

### Requirement: User can view collections table

The system SHALL display a table of all collections for the current store on the store detail page.

#### Scenario: Table displays on store detail page
- **WHEN** user views a store detail page
- **THEN** collections table is visible below the "Cuentas de Cobro" header

#### Scenario: Table columns display collection data
- **WHEN** collections table is displayed
- **THEN** table shows columns: No., Fecha, Total, Estado, PDF, Actions

#### Scenario: Collections sorted by date descending
- **WHEN** collections table loads
- **THEN** collections are ordered by created_at date, newest first

### Requirement: User can filter collections by state

The system SHALL provide a dropdown to filter collections by their state.

#### Scenario: State filter dropdown displays
- **WHEN** collections table is displayed
- **THEN** state filter dropdown shows options: "Todos", "Borrador", "Activo", "Pagado", "Cancelado"

#### Scenario: Filter by draft state
- **WHEN** user selects "Borrador" in state filter
- **THEN** table displays only collections with state "draft"

#### Scenario: Filter by active state
- **WHEN** user selects "Activo" in state filter
- **THEN** table displays only collections with state "active"

#### Scenario: Filter by paid state
- **WHEN** user selects "Pagado" in state filter
- **THEN** table displays only collections with state "paid"

#### Scenario: Filter by cancelled state
- **WHEN** user selects "Cancelado" in state filter
- **THEN** table displays only collections with state "cancelled"

#### Scenario: Reset filter to show all
- **WHEN** user selects "Todos" in state filter
- **THEN** table displays all collections regardless of state

### Requirement: User can view collection details in table

The system SHALL display key collection information in each table row.

#### Scenario: Display collection number
- **WHEN** collection is displayed in table
- **THEN** "No." column shows collection_number

#### Scenario: Display creation date
- **WHEN** collection is displayed in table
- **THEN** "Fecha" column shows created_at formatted as "YYYY-MM-DD"

#### Scenario: Display total price
- **WHEN** collection is displayed in table
- **THEN** "Total" column shows total_price formatted as Colombian currency (e.g., "$180,000 COP")

#### Scenario: Display state badge
- **WHEN** collection is displayed in table
- **THEN** "Estado" column shows colored badge with state text in Spanish

### Requirement: System displays state badges with colors

The system SHALL use color-coded badges to indicate collection states.

#### Scenario: Draft state badge
- **WHEN** collection has state "draft"
- **THEN** badge shows "Borrador" with yellow background color

#### Scenario: Active state badge
- **WHEN** collection has state "active"
- **THEN** badge shows "Activo" with blue background color

#### Scenario: Paid state badge
- **WHEN** collection has state "paid"
- **THEN** badge shows "Pagado" with green background color

#### Scenario: Cancelled state badge
- **WHEN** collection has state "cancelled"
- **THEN** badge shows "Cancelado" with red background color

### Requirement: User can access PDF documents

The system SHALL provide links to view generated PDF documents in Google Drive.

#### Scenario: PDF link displays for finalized collections
- **WHEN** collection has state "active", "paid", or "cancelled" and has document_id
- **THEN** "PDF" column shows clickable link icon

#### Scenario: No PDF link for draft collections
- **WHEN** collection has state "draft"
- **THEN** "PDF" column shows "-" or empty

#### Scenario: PDF link opens in new tab
- **WHEN** user clicks PDF link
- **THEN** Google Drive document opens in new browser tab with URL "https://drive.google.com/file/d/{document_id}/view"

### Requirement: User can access collection actions

The system SHALL provide an actions dropdown menu for each collection row.

#### Scenario: Actions dropdown displays for draft collections
- **WHEN** collection has state "draft"
- **THEN** actions dropdown shows options: "Editar", "Finalizar", "Cancelar"

#### Scenario: Actions dropdown displays for active collections
- **WHEN** collection has state "active"
- **THEN** actions dropdown shows options: "Ver detalles", "Marcar como pagado", "Cancelar"

#### Scenario: Actions dropdown displays for terminal states
- **WHEN** collection has state "paid" or "cancelled"
- **THEN** actions dropdown shows option: "Ver detalles"

### Requirement: System displays empty state when no collections

The system SHALL show a helpful message when no collections exist for the store.

#### Scenario: Empty state for new stores
- **WHEN** store has no collections
- **THEN** table shows empty state message "No hay cuentas de cobro. Crea la primera cuenta de cobro para este comercio."

#### Scenario: Empty state after filtering
- **WHEN** state filter returns no results
- **THEN** table shows message "No hay cuentas de cobro con este estado."

### Requirement: System displays loading state

The system SHALL indicate when collections data is being fetched.

#### Scenario: Show loading skeleton on initial load
- **WHEN** collections data is being fetched for the first time
- **THEN** table displays skeleton loader with placeholder rows

#### Scenario: Hide loading state when data loaded
- **WHEN** collections data fetch completes successfully
- **THEN** loading skeleton is replaced with collection rows

### Requirement: System displays error state

The system SHALL show error messages when collection data cannot be loaded.

#### Scenario: Show error message on fetch failure
- **WHEN** collections data fetch fails with error
- **THEN** error message displays "Error al cargar cuentas de cobro: {error message}"

#### Scenario: Provide retry action on error
- **WHEN** error message is displayed
- **THEN** "Reintentar" button is visible to retry the fetch

### Requirement: User can sort collections by date

The system SHALL allow users to sort collections by creation date.

#### Scenario: Default sort is newest first
- **WHEN** collections table loads
- **THEN** collections are sorted by created_at descending (newest first)

#### Scenario: Toggle sort to oldest first
- **WHEN** user clicks "Fecha" column header
- **THEN** collections are sorted by created_at ascending (oldest first)

#### Scenario: Toggle sort back to newest first
- **WHEN** user clicks "Fecha" column header again
- **THEN** collections are sorted by created_at descending (newest first)

### Requirement: User can sort collections by number

The system SHALL allow users to sort collections by collection number.

#### Scenario: Sort by collection number ascending
- **WHEN** user clicks "No." column header
- **THEN** collections are sorted by collection_number ascending

#### Scenario: Sort by collection number descending
- **WHEN** user clicks "No." column header again
- **THEN** collections are sorted by collection_number descending
