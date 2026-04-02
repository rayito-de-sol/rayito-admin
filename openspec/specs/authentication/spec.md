## ADDED Requirements

### Requirement: User can sign in with email and password
The system SHALL integrate with Supabase authentication to allow users to sign in using their email address and password.

#### Scenario: Successful sign in
- **WHEN** user enters valid credentials and submits the login form
- **THEN** system authenticates via Supabase, stores JWT token, and redirects to dashboard

#### Scenario: Invalid credentials
- **WHEN** user enters incorrect email or password
- **THEN** system displays inline error message "Credenciales inválidas"

#### Scenario: Network error during sign in
- **WHEN** network request fails during authentication
- **THEN** system displays inline error message "Error de conexión. Intente nuevamente"

### Requirement: System manages authentication state globally
The system SHALL maintain global authentication state using Zustand store, accessible from any component.

#### Scenario: User state available after sign in
- **WHEN** user successfully signs in
- **THEN** Zustand store updates with user data (id, email, role) and auth state is true

#### Scenario: User state cleared on sign out
- **WHEN** user signs out
- **THEN** Zustand store clears user data and auth state becomes false

#### Scenario: User state persists across page refreshes
- **WHEN** user refreshes the browser
- **THEN** system restores auth state from Supabase session stored in localStorage

### Requirement: User can sign out
The system SHALL allow authenticated users to sign out and clear their session.

#### Scenario: Successful sign out
- **WHEN** user clicks sign out button
- **THEN** system calls Supabase signOut, clears Zustand store, clears localStorage, and redirects to login page

### Requirement: System protects routes requiring authentication
The system SHALL prevent unauthenticated users from accessing protected routes.

#### Scenario: Unauthenticated user attempts to access protected route
- **WHEN** unauthenticated user navigates to a protected route (e.g., /dashboard)
- **THEN** system redirects to /login page

#### Scenario: Authenticated user accesses protected route
- **WHEN** authenticated user navigates to a protected route
- **THEN** system renders the requested page

#### Scenario: Authenticated user tries to access login page
- **WHEN** authenticated user navigates to /login
- **THEN** system redirects to /dashboard (already logged in)

### Requirement: System refreshes JWT tokens automatically
The system SHALL use Supabase client to automatically refresh JWT tokens before expiration.

#### Scenario: Token nearing expiration
- **WHEN** JWT token is close to expiration
- **THEN** Supabase client automatically refreshes token in background without user interaction

#### Scenario: Token refresh fails
- **WHEN** token refresh fails (e.g., network error, revoked session)
- **THEN** system signs user out and redirects to login page

### Requirement: Login page displays Supabase Auth UI
The system SHALL render the login page with Supabase Auth UI component for email/password authentication.

#### Scenario: User visits login page
- **WHEN** user navigates to /login
- **THEN** system displays Supabase Auth UI with email and password fields in Spanish

#### Scenario: User signs up via login page
- **WHEN** user clicks "Crear cuenta" link in Supabase Auth UI
- **THEN** system validates email against backend whitelist after signup completes

### Requirement: System validates email whitelist on first authentication
The system SHALL verify that user's email is in the backend whitelist before allowing access.

#### Scenario: Whitelisted email signs in
- **WHEN** user with whitelisted email signs in for the first time
- **THEN** backend auto-creates user profile and returns success

#### Scenario: Non-whitelisted email attempts sign in
- **WHEN** user with non-whitelisted email completes Supabase authentication
- **THEN** backend returns 403 error and frontend displays "Tu email no está autorizado para acceder"
