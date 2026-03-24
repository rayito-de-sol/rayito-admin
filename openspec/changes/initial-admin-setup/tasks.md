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

- [ ] 3.1 Configure Tailwind CSS (tailwind.config.js with shadcn theme)
- [ ] 3.2 Configure ESLint (.eslintrc.cjs with React and TypeScript rules)
- [ ] 3.3 Configure Prettier (.prettierrc with project standards)
- [ ] 3.4 Create .gitignore (node_modules, dist, .env.local, etc.)
- [ ] 3.5 Create .env.example with required variables (VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] 3.6 Create environment config module (src/config.ts) to validate and export env vars

## 4. Type Definitions

- [ ] 4.1 Create user types (src/types/user.ts with User, UserRole)
- [ ] 4.2 Create API response types (src/types/api.ts with ApiError, ApiResponse)
- [ ] 4.3 Extend ImportMetaEnv interface for Vite environment variables (src/vite-env.d.ts)

## 5. Zustand Stores

- [ ] 5.1 Create auth store (src/stores/useAuthStore.ts with user state, setUser, clearUser, isAuthenticated)
- [ ] 5.2 Create UI store (src/stores/useUIStore.ts with isLoading, setLoading, error, setError, clearError)

## 6. Supabase Integration

- [ ] 6.1 Create Supabase client module (src/services/supabase.ts)
- [ ] 6.2 Create auth service (src/services/auth.ts) with signIn, signOut, getCurrentSession
- [ ] 6.3 Integrate Supabase onAuthStateChange with Zustand auth store
- [ ] 6.4 Create useAuth hook (src/hooks/useAuth.ts) to simplify auth state access

## 7. API Client

- [ ] 7.1 Create Axios client instance (src/services/api/client.ts) with baseURL and timeout
- [ ] 7.2 Add request interceptor to inject JWT token from Supabase session
- [ ] 7.3 Add response interceptor to handle errors (401, 403, 404, 500, network errors) with Spanish messages
- [ ] 7.4 Create API error handler utility (src/utils/apiError.ts)
- [ ] 7.5 Create user API endpoints (src/services/api/endpoints/users.ts) with typed functions
- [ ] 7.6 Export centralized API module (src/services/api/index.ts)

## 8. Routing Setup

- [ ] 8.1 Create ProtectedRoute component (src/components/ProtectedRoute.tsx) that checks auth and redirects
- [ ] 8.2 Create App.tsx with React Router configuration
- [ ] 8.3 Define route structure (/ → redirect, /login, /dashboard protected)
- [ ] 8.4 Create 404 Not Found page (src/pages/NotFoundPage.tsx) in Spanish
- [ ] 8.5 Implement returnTo query parameter handling in login redirect

## 9. Layout Components

- [ ] 9.1 Create Layout component (src/components/Layout.tsx) with header, navigation, and content area
- [ ] 9.2 Create Header component (src/components/Header.tsx) with app title and user menu
- [ ] 9.3 Create Navigation component (src/components/Navigation.tsx) with links and active state highlighting
- [ ] 9.4 Create UserMenu component (src/components/UserMenu.tsx) with user name, email, and sign out button
- [ ] 9.5 Apply Layout to all protected routes

## 10. Authentication Pages

- [ ] 10.1 Create LoginPage component (src/pages/LoginPage.tsx) with Supabase Auth UI
- [ ] 10.2 Configure Supabase Auth UI for Spanish localization
- [ ] 10.3 Handle authentication success and redirect to dashboard (or returnTo URL)
- [ ] 10.4 Display authentication errors inline (invalid credentials, network error, non-whitelisted email)
- [ ] 10.5 Redirect authenticated users away from login page

## 11. Dashboard Page

- [ ] 11.1 Create DashboardPage component (src/pages/DashboardPage.tsx) with empty state
- [ ] 11.2 Display welcome message with user name
- [ ] 11.3 Add placeholder content ("Dashboard en construcción")

## 12. Error Handling

- [ ] 12.1 Create ErrorBoundary component (src/components/ErrorBoundary.tsx) to catch rendering errors
- [ ] 12.2 Wrap App component with ErrorBoundary in main.tsx
- [ ] 12.3 Display user-friendly error message in Spanish with reset button
- [ ] 12.4 Log errors to console for debugging

## 13. Loading States

- [ ] 13.1 Create LoadingSpinner component (src/components/LoadingSpinner.tsx)
- [ ] 13.2 Create GlobalLoading component (src/components/GlobalLoading.tsx) that reads from useUIStore
- [ ] 13.3 Render GlobalLoading in App.tsx
- [ ] 13.4 Use setLoading in auth store during sign in/sign out operations

## 14. Utility Functions

- [ ] 14.1 Create className utility (src/lib/utils.ts) with cn() function for merging Tailwind classes
- [ ] 14.2 Create date formatting utilities (src/utils/date.ts) for consistent date display

## 15. Package.json Scripts

- [ ] 15.1 Add dev script (vite)
- [ ] 15.2 Add build script (tsc && vite build)
- [ ] 15.3 Add preview script (vite preview)
- [ ] 15.4 Add lint script (eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0)
- [ ] 15.5 Add format script (prettier --write \"src/**/*.{ts,tsx,css,md}\")

## 16. Documentation

- [ ] 16.1 Create README.md with project overview, setup instructions, and available scripts
- [ ] 16.2 Document environment variables in .env.example with comments
- [ ] 16.3 Add inline code comments for complex logic (auth flow, error handling, interceptors)

## 17. Testing & Validation

- [ ] 17.1 Verify successful sign in flow with valid credentials
- [ ] 17.2 Verify invalid credentials show error message
- [ ] 17.3 Verify protected routes redirect to login when not authenticated
- [ ] 17.4 Verify authenticated users can access dashboard
- [ ] 17.5 Verify sign out clears session and redirects to login
- [ ] 17.6 Verify token auto-refresh works (check console logs)
- [ ] 17.7 Verify 401 error triggers automatic sign out
- [ ] 17.8 Verify error boundary catches rendering errors
- [ ] 17.9 Verify loading spinner displays during auth operations
- [ ] 17.10 Verify returnTo parameter works after login
- [ ] 17.11 Run linter and fix any warnings
- [ ] 17.12 Test in different browsers (Chrome, Firefox)
