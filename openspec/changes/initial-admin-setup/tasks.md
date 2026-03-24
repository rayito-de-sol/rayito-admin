## 1. Project Initialization

- [x] 1.1 Initialize Vite React TypeScript project in rayito-admin root
- [x] 1.2 Configure pnpm as package manager (create .npmrc)
- [x] 1.3 Update tsconfig.json with strict mode and path aliases
- [x] 1.4 Configure vite.config.ts with path resolution and build settings
- [x] 1.5 Create initial directory structure (src/components, src/pages, src/services, src/stores, src/types, src/utils, src/lib, src/hooks)

## 2. Dependencies Installation

- [x] 2.1 Install React Router v6 (react-router-dom)
- [x] 2.2 Install Zustand for state management
- [x] 2.3 Install Supabase client (@supabase/supabase-js)
- [x] 2.4 Install Axios for HTTP client
- [x] 2.5 Install Tailwind CSS and configure
- [x] 2.6 Initialize shadcn/ui and install initial components (Button, Input, Card, Alert)
- [x] 2.7 Install development dependencies (ESLint, Prettier, TypeScript plugins)

## 3. Configuration Files

- [x] 3.1 Configure Tailwind CSS (tailwind.config.js with shadcn theme)
- [x] 3.2 Configure ESLint (.eslintrc.cjs with React and TypeScript rules)
- [x] 3.3 Configure Prettier (.prettierrc with project standards)
- [x] 3.4 Create .gitignore (node_modules, dist, .env.local, etc.)
- [x] 3.5 Create .env.example with required variables (VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [x] 3.6 Create environment config module (src/config.ts) to validate and export env vars

## 4. Type Definitions

- [x] 4.1 Create user types (src/types/user.ts with User, UserRole)
- [x] 4.2 Create API response types (src/types/api.ts with ApiError, ApiResponse)
- [x] 4.3 Extend ImportMetaEnv interface for Vite environment variables (src/vite-env.d.ts)

## 5. Zustand Stores

- [x] 5.1 Create auth store (src/stores/useAuthStore.ts with user state, setUser, clearUser, isAuthenticated)
- [x] 5.2 Create UI store (src/stores/useUIStore.ts with isLoading, setLoading, error, setError, clearError)

## 6. Supabase Integration

- [x] 6.1 Create Supabase client module (src/services/supabase.ts)
- [x] 6.2 Create auth service (src/services/auth.ts) with signIn, signOut, getCurrentSession
- [x] 6.3 Integrate Supabase onAuthStateChange with Zustand auth store
- [x] 6.4 Create useAuth hook (src/hooks/useAuth.ts) to simplify auth state access

## 7. API Client

- [x] 7.1 Create Axios client instance (src/services/api/client.ts) with baseURL and timeout
- [x] 7.2 Add request interceptor to inject JWT token from Supabase session
- [x] 7.3 Add response interceptor to handle errors (401, 403, 404, 500, network errors) with Spanish messages
- [x] 7.4 Create API error handler utility (src/utils/apiError.ts)
- [x] 7.5 Create user API endpoints (src/services/api/endpoints/users.ts) with typed functions
- [x] 7.6 Export centralized API module (src/services/api/index.ts)

## 8. Routing Setup

- [x] 8.1 Create ProtectedRoute component (src/components/ProtectedRoute.tsx) that checks auth and redirects
- [x] 8.2 Create App.tsx with React Router configuration
- [x] 8.3 Define route structure (/ → redirect, /login, /dashboard protected)
- [x] 8.4 Create 404 Not Found page (src/pages/NotFoundPage.tsx) in Spanish
- [x] 8.5 Implement returnTo query parameter handling in login redirect

## 9. Layout Components

- [x] 9.1 Create Layout component (src/components/Layout.tsx) with header, navigation, and content area
- [x] 9.2 Create Header component (src/components/Header.tsx) with app title and user menu
- [x] 9.3 Create Navigation component (src/components/Navigation.tsx) with links and active state highlighting
- [x] 9.4 Create UserMenu component (src/components/UserMenu.tsx) with user name, email, and sign out button
- [x] 9.5 Apply Layout to all protected routes

## 10. Authentication Pages

- [x] 10.1 Create LoginPage component (src/pages/LoginPage.tsx) with Supabase Auth UI
- [x] 10.2 Configure Supabase Auth UI for Spanish localization
- [x] 10.3 Handle authentication success and redirect to dashboard (or returnTo URL)
- [x] 10.4 Display authentication errors inline (invalid credentials, network error, non-whitelisted email)
- [x] 10.5 Redirect authenticated users away from login page

## 11. Dashboard Page

- [x] 11.1 Create DashboardPage component (src/pages/DashboardPage.tsx) with empty state
- [x] 11.2 Display welcome message with user name
- [x] 11.3 Add placeholder content ("Dashboard en construcción")

## 12. Error Handling

- [x] 12.1 Create ErrorBoundary component (src/components/ErrorBoundary.tsx) to catch rendering errors
- [x] 12.2 Wrap App component with ErrorBoundary in main.tsx
- [x] 12.3 Display user-friendly error message in Spanish with reset button
- [x] 12.4 Log errors to console for debugging

## 13. Loading States

- [x] 13.1 Create LoadingSpinner component (src/components/LoadingSpinner.tsx)
- [x] 13.2 Create GlobalLoading component (src/components/GlobalLoading.tsx) that reads from useUIStore
- [x] 13.3 Render GlobalLoading in App.tsx
- [x] 13.4 Use setLoading in auth store during sign in/sign out operations

## 14. Utility Functions

- [x] 14.1 Create className utility (src/lib/utils.ts) with cn() function for merging Tailwind classes
- [x] 14.2 Create date formatting utilities (src/utils/date.ts) for consistent date display

## 15. Package.json Scripts

- [x] 15.1 Add dev script (vite)
- [x] 15.2 Add build script (tsc && vite build)
- [x] 15.3 Add preview script (vite preview)
- [x] 15.4 Add lint script (eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0)
- [x] 15.5 Add format script (prettier --write \"src/**/*.{ts,tsx,css,md}\")

## 16. Documentation

- [x] 16.1 Create README.md with project overview, setup instructions, and available scripts
- [x] 16.2 Document environment variables in .env.example with comments
- [x] 16.3 Add inline code comments for complex logic (auth flow, error handling, interceptors)

## 17. Testing & Validation

- [x] 17.1 Verify successful sign in flow with valid credentials
- [x] 17.2 Verify invalid credentials show error message
- [x] 17.3 Verify protected routes redirect to login when not authenticated
- [x] 17.4 Verify authenticated users can access dashboard
- [x] 17.5 Verify sign out clears session and redirects to login
- [x] 17.6 Verify token auto-refresh works (check console logs)
- [x] 17.7 Verify 401 error triggers automatic sign out
- [x] 17.8 Verify error boundary catches rendering errors
- [x] 17.9 Verify loading spinner displays during auth operations
- [x] 17.10 Verify returnTo parameter works after login
- [x] 17.11 Run linter and fix any warnings
- [x] 17.12 Test in different browsers (Chrome, Firefox)
