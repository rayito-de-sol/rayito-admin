## ADDED Requirements

### Requirement: System SHALL provide API service for store operations
The system SHALL provide a dedicated service module with functions for all store CRUD operations communicating with backend API.

#### Scenario: Service exports all CRUD functions
- **WHEN** stores service module is imported
- **THEN** module exports functions: listStores, getStore, createStore, updateStore

#### Scenario: Service uses configured API base URL
- **WHEN** any service function makes API request
- **THEN** request uses VITE_API_URL environment variable as base URL

### Requirement: System SHALL implement listStores function
The system SHALL provide listStores function that fetches all stores from GET /stores endpoint.

#### Scenario: Successful list stores request
- **WHEN** listStores function is called
- **THEN** function makes GET request to /api/v1/stores and returns array of Store objects with nested Address and CollectionDocConfig data

#### Scenario: List stores with empty result
- **WHEN** listStores is called and API returns empty array
- **THEN** function returns empty array without error

### Requirement: System SHALL implement getStore function
The system SHALL provide getStore function that fetches single store by ID from GET /stores/:id endpoint.

#### Scenario: Successful get store request
- **WHEN** getStore function is called with valid store ID
- **THEN** function makes GET request to /api/v1/stores/:id and returns Store object with nested Address and CollectionDocConfig data

#### Scenario: Get store not found
- **WHEN** getStore is called with non-existent ID and API returns 404
- **THEN** function throws error with message "Tienda no encontrada"

### Requirement: System SHALL implement createStore function
The system SHALL provide createStore function that creates new store via POST /stores endpoint.

#### Scenario: Successful create store request
- **WHEN** createStore function is called with valid store data
- **THEN** function makes POST request to /api/v1/stores with all store fields, address fields, and config fields in request body and returns created Store object with generated ID

#### Scenario: Create store with duplicate identity
- **WHEN** createStore is called and API returns 409 conflict error
- **THEN** function throws error with message "Ya existe una tienda con este número de identificación"

#### Scenario: Create store with validation error
- **WHEN** createStore is called and API returns 400 validation error
- **THEN** function throws error with validation message from API response

### Requirement: System SHALL implement updateStore function
The system SHALL provide updateStore function that updates existing store via PATCH /stores/:id endpoint.

#### Scenario: Successful update store request
- **WHEN** updateStore function is called with store ID and partial update data
- **THEN** function makes PATCH request to /api/v1/stores/:id with only provided fields in request body and returns updated Store object

#### Scenario: Update store not found
- **WHEN** updateStore is called with non-existent ID and API returns 404
- **THEN** function throws error with message "Tienda no encontrada"

#### Scenario: Update with duplicate identity
- **WHEN** updateStore is called and API returns 409 conflict error
- **THEN** function throws error with message "Ya existe una tienda con este número de identificación"

### Requirement: System SHALL include authentication headers
The system SHALL automatically include JWT authentication token in all API requests using Axios interceptors.

#### Scenario: Authenticated request
- **WHEN** any service function makes API request
- **THEN** request includes Authorization header with Bearer token from Supabase session

#### Scenario: Unauthenticated request
- **WHEN** API request is made without valid session and returns 401
- **THEN** Axios interceptor redirects user to login page

### Requirement: System SHALL handle network errors
The system SHALL provide clear error messages for network and server errors.

#### Scenario: Network error during request
- **WHEN** API request fails due to network error (no connection, timeout)
- **THEN** function throws error with message "Error de conexión. Por favor, intenta de nuevo."

#### Scenario: Server error during request
- **WHEN** API request returns 500 internal server error
- **THEN** function throws error with message "Error del servidor. Por favor, intenta de nuevo más tarde."

### Requirement: System SHALL define TypeScript types
The system SHALL provide TypeScript interfaces matching backend domain models for type safety.

#### Scenario: Store type definition
- **WHEN** Store type is imported
- **THEN** type includes all fields: id, identity_number, name, legal_name, identity_type, address_id, address (nested), contact_phone_number, contact_person_name, contact_person_email, discount_percentage, deduct_vat, config_id, collection_doc_config (nested), created_at, updated_at

#### Scenario: Address type definition
- **WHEN** Address type is imported
- **THEN** type includes fields: id, line1, line2, city, state, postal_code, country, created_at, updated_at

#### Scenario: CollectionDocConfig type definition
- **WHEN** CollectionDocConfig type is imported
- **THEN** type includes fields: id, include_products_detail, include_unit_value, include_sku_in_detail, detail_in_appendix, include_legal_income_note, created_at, updated_at
