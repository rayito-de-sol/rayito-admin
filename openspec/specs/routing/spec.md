## ADDED Requirements

### Requirement: System configures client-side routing
The system SHALL use React Router v6 for client-side navigation without full page reloads.

#### Scenario: Navigating between routes
- **WHEN** user clicks a navigation link
- **THEN** browser URL updates and new component renders without page reload

#### Scenario: Browser back/forward buttons
- **WHEN** user clicks browser back or forward button
- **THEN** application navigates to previous or next route in history

### Requirement: System defines public routes
The system SHALL expose routes that do not require authentication.

#### Scenario: Login route accessible without auth
- **WHEN** unauthenticated user navigates to /login
- **THEN** system displays login page

#### Scenario: Root route redirects to dashboard
- **WHEN** user navigates to / (root path)
- **THEN** system redirects to /dashboard if authenticated, /login if not

### Requirement: System defines protected routes
The system SHALL restrict access to routes that require authentication.

#### Scenario: Dashboard route requires authentication
- **WHEN** authenticated user navigates to /dashboard
- **THEN** system displays dashboard page

#### Scenario: Unauthenticated user blocked from dashboard
- **WHEN** unauthenticated user attempts to access /dashboard
- **THEN** system redirects to /login

### Requirement: System provides ProtectedRoute wrapper component
The system SHALL implement a ProtectedRoute component that enforces authentication checks.

#### Scenario: ProtectedRoute allows authenticated users
- **WHEN** authenticated user accesses route wrapped in ProtectedRoute
- **THEN** component renders child route component

#### Scenario: ProtectedRoute blocks unauthenticated users
- **WHEN** unauthenticated user accesses route wrapped in ProtectedRoute
- **THEN** component redirects to /login

#### Scenario: ProtectedRoute preserves intended destination
- **WHEN** unauthenticated user attempts to access /dashboard
- **THEN** system redirects to /login with return URL parameter (e.g., /login?returnTo=/dashboard)

#### Scenario: User redirected after login
- **WHEN** user logs in with returnTo parameter
- **THEN** system redirects to original intended destination

### Requirement: System provides basic navigation structure
The system SHALL render a navigation menu accessible from protected pages.

#### Scenario: Navigation menu visible on protected routes
- **WHEN** authenticated user is on a protected route
- **THEN** navigation menu displays with links to available pages

#### Scenario: Navigation menu shows current route
- **WHEN** user is on a specific route
- **THEN** navigation menu highlights the active link

### Requirement: System handles 404 Not Found routes
The system SHALL display a 404 page for undefined routes.

#### Scenario: User navigates to non-existent route
- **WHEN** user navigates to a route that doesn't exist (e.g., /xyz)
- **THEN** system displays 404 page with message "Página no encontrada" and link to dashboard

### Requirement: System provides layout wrapper for protected pages
The system SHALL render a consistent layout (header, nav, content) for all protected routes.

#### Scenario: Protected pages use layout
- **WHEN** user accesses any protected route
- **THEN** system renders Layout component with header, navigation, and route content

#### Scenario: Login page excludes layout
- **WHEN** user accesses /login
- **THEN** system renders login page without header or navigation

### Requirement: System uses declarative route configuration
The system SHALL define all routes in a centralized, declarative configuration.

#### Scenario: Routes defined in App.tsx
- **WHEN** developer wants to add a new route
- **THEN** developer adds route definition to routes array in App.tsx

#### Scenario: Route configuration includes metadata
- **WHEN** defining a route
- **THEN** route includes path, element, and whether it requires authentication
