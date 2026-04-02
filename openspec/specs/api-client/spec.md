## ADDED Requirements

### Requirement: System creates HTTP client for backend API
The system SHALL provide an Axios-based HTTP client configured to communicate with the rayito-api backend.

#### Scenario: Client configured with base URL
- **WHEN** application initializes
- **THEN** Axios client uses `VITE_API_URL` environment variable as baseURL

#### Scenario: Client sets default headers
- **WHEN** making any API request
- **THEN** client includes `Content-Type: application/json` and `Accept: application/json` headers

#### Scenario: Client enforces timeout
- **WHEN** API request takes longer than 30 seconds
- **THEN** client cancels request and throws timeout error

### Requirement: System injects JWT token in API requests
The system SHALL automatically include the JWT token in the Authorization header for all authenticated requests.

#### Scenario: Authenticated request includes token
- **WHEN** user is signed in and makes an API request
- **THEN** client retrieves token from Supabase session and adds `Authorization: Bearer <token>` header

#### Scenario: Unauthenticated request omits token
- **WHEN** user is not signed in and makes a public API request
- **THEN** client sends request without Authorization header

### Requirement: System handles API errors consistently
The system SHALL intercept API responses and handle errors in a standardized way.

#### Scenario: 401 Unauthorized response
- **WHEN** API returns 401 status code
- **THEN** client signs user out, clears session, and redirects to /login

#### Scenario: 403 Forbidden response
- **WHEN** API returns 403 status code
- **THEN** client throws error with message "No tienes permiso para realizar esta acción"

#### Scenario: 404 Not Found response
- **WHEN** API returns 404 status code
- **THEN** client throws error with message "Recurso no encontrado"

#### Scenario: 500 Server Error response
- **WHEN** API returns 500 status code
- **THEN** client throws error with message "Error del servidor. Intente nuevamente más tarde"

#### Scenario: Network error (no response)
- **WHEN** network request fails completely (no response received)
- **THEN** client throws error with message "Error de conexión. Verifique su red e intente nuevamente"

#### Scenario: Backend returns structured error
- **WHEN** API returns error response with `message` field in JSON body
- **THEN** client throws error with backend message instead of default message

### Requirement: System provides typed API endpoint functions
The system SHALL expose TypeScript-typed functions for each backend endpoint.

#### Scenario: Calling typed endpoint function
- **WHEN** component calls an endpoint function (e.g., `getUserProfile()`)
- **THEN** function returns typed response matching backend API contract

#### Scenario: Type checking at compile time
- **WHEN** developer calls endpoint function with incorrect parameters
- **THEN** TypeScript compiler shows type error

### Requirement: API client handles request/response transformations
The system SHALL transform request and response data as needed for type safety.

#### Scenario: Date strings converted to Date objects
- **WHEN** API returns date strings in ISO 8601 format
- **THEN** client transforms them to JavaScript Date objects before returning to caller

#### Scenario: Empty response body handled
- **WHEN** API returns 204 No Content or empty response
- **THEN** client returns undefined or null without throwing error

### Requirement: System centralizes API configuration
The system SHALL store API base URL and timeout in a single configuration file.

#### Scenario: Configuration read from environment
- **WHEN** application starts
- **THEN** API client reads `VITE_API_URL` from environment and uses it for all requests

#### Scenario: Development vs production URLs
- **WHEN** running in development environment
- **THEN** API client uses localhost URL (e.g., http://localhost:8080/api/v1)

#### Scenario: Missing API URL environment variable
- **WHEN** `VITE_API_URL` is not set
- **THEN** application throws error at startup with message "VITE_API_URL is required"
