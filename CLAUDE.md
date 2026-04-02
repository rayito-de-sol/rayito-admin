# Rayito Admin - Frontend Technical Guidelines

This document provides technical guidelines and conventions for the rayito-admin frontend application. For general project context, see the parent `CLAUDE.md`.

## Tech Stack

**Core Framework**
- React 18.3 with TypeScript 5.7
- Vite 6.4 (build tool and dev server)
- pnpm (package manager)

**State Management**
- Zustand (lightweight state management)
- No Redux or Context API - keep it simple

**UI & Styling**
- Tailwind CSS v4 with @tailwindcss/postcss
- shadcn/ui (copy-paste component library)
- Lucide React (icons)

**Authentication**
- Supabase Auth (JWT tokens)
- @supabase/supabase-js client
- @supabase/auth-ui-react (pre-built Auth UI)

**Routing & HTTP**
- React Router v6
- Axios (HTTP client with interceptors)

**Language**
- Spanish only (all UI text, error messages, comments in Spanish)

## Project Structure

```
rayito-admin/
├── public/              # Static assets (logo, etc.)
├── src/
│   ├── components/      # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page-level components
│   ├── services/       # API clients, auth, external services
│   ├── stores/         # Zustand stores
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main app component with routing
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles and theme tokens
├── .env.example        # Environment variable template
└── CLAUDE.md          # This file
```

## Theme & Color System

### Using Color Tokens

**IMPORTANT**: Always use tokenized colors from `src/index.css`. Never hardcode color values in components.

**Available Color Tokens:**

```css
/* Brand Colors */
--color-primary: #7a605d           /* Main brand color (brown) */
--color-primary-foreground: #ffffff
--color-brand-brown: #7a605d       /* Explicit brand brown */
--color-brand-tan: #c4b098         /* Explicit brand tan */

/* Sidebar/Navigation */
--color-sidebar: #c4b098           /* Left panel background */
--color-sidebar-foreground: #ffffff
--color-sidebar-active: #b39a80    /* Active nav item */

/* Base Colors */
--color-background: #ffffff
--color-foreground: #1a1a1a
--color-card: #ffffff
--color-card-foreground: #1a1a1a

/* Semantic Colors */
--color-secondary: #f5f5f5
--color-secondary-foreground: #1a1a1a
--color-muted: #f5f5f5
--color-muted-foreground: #737373
--color-destructive: #dc2626
--color-destructive-foreground: #ffffff

/* UI Elements */
--color-border: #e5e5e5
--color-input: #e5e5e5
--color-ring: #7a605d             /* Focus rings */
```

### How to Use Color Tokens

**In Tailwind Classes:**
```tsx
// ✅ Good - using Tailwind color utilities that map to tokens
<button className="bg-primary text-primary-foreground">Click me</button>
<div className="bg-sidebar text-sidebar-foreground">Sidebar</div>
<h1 className="text-foreground">Heading</h1>

// ❌ Bad - hardcoded colors
<button className="bg-[#7a605d] text-white">Click me</button>
```

**In Inline Styles (when necessary):**
```tsx
// ✅ Good - using CSS variables
<div style={{ backgroundColor: 'var(--color-sidebar)' }}>
  Sidebar content
</div>

// ❌ Bad - hardcoded colors
<div style={{ backgroundColor: '#c4b098' }}>
  Sidebar content
</div>
```

**Global Heading Styles:**

All h1-h6 elements automatically use `var(--color-brand-brown)` via global CSS in `src/index.css`. No need to add color classes to headings unless you need a different color.

```tsx
// ✅ Good - uses brand brown automatically
<h1 className="text-3xl font-bold">Dashboard</h1>

// ❌ Bad - redundant color class (unless you need a different color)
<h1 className="text-3xl font-bold text-[#7a605d]">Dashboard</h1>
```

### Tailwind Color Mapping

Tailwind utilities automatically map to theme tokens:

- `bg-primary` → `var(--color-primary)`
- `text-foreground` → `var(--color-foreground)`
- `border-border` → `var(--color-border)`
- `bg-destructive` → `var(--color-destructive)`
- etc.

See `src/index.css` for the full `@theme` definition.

## State Management with Zustand

**Keep stores simple and focused:**

```typescript
// ✅ Good - simple, focused store
import { create } from 'zustand'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}))
```

**Avoid:**
- Complex middleware (persist, devtools, etc.) - YAGNI
- Nested stores or complex state structures
- Actions that do more than update state (put logic in services)

## Authentication Flow

**Architecture:**
1. Supabase handles authentication (JWT tokens)
2. `authInit.ts` listens to `onAuthStateChange` events
3. Auth state syncs to Zustand store (`useAuthStore`)
4. `ProtectedRoute` component checks auth state for routing

**Key Files:**
- `src/services/supabase.ts` - Supabase client initialization
- `src/services/auth.ts` - Auth service (signIn, signOut, getCurrentUser)
- `src/services/authInit.ts` - Auth state listener and sync
- `src/stores/useAuthStore.ts` - Auth state store
- `src/hooks/useAuth.ts` - Auth hook for components
- `src/components/ProtectedRoute.tsx` - Route guard

**Important Pattern:**

When working with `onAuthStateChange`, always pass the session from the event to `getCurrentUser()` to avoid deadlocks:

```typescript
// ✅ Good - pass session from event
supabase.auth.onAuthStateChange(async (_event, session) => {
  if (session?.user) {
    const user = await authService.getCurrentUser(session)
    useAuthStore.getState().setUser(user)
  }
})

// ❌ Bad - calling getSession() from within callback causes deadlock
supabase.auth.onAuthStateChange(async (_event, session) => {
  if (session?.user) {
    const user = await authService.getCurrentUser() // internally calls getSession()
    useAuthStore.getState().setUser(user)
  }
})
```

## Component Guidelines

### shadcn/ui Components

Components from shadcn/ui are copied into `src/components/ui/` and can be customized freely.

**Installation pattern:**
```bash
pnpx shadcn@latest add button card input
```

**Usage:**
```tsx
import { Button } from '@/components/ui/button'

<Button variant="default">Click me</Button>
```

### Custom Components

**Keep components simple and focused:**

```tsx
// ✅ Good - simple, single responsibility
export const UserMenu = () => {
  const { user, signOut } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-sm font-medium">{user.fullName || user.email}</p>
        <p className="text-xs text-muted-foreground">{user.role}</p>
      </div>
      <button onClick={signOut}>Cerrar sesión</button>
    </div>
  )
}
```

**Avoid:**
- Complex props interfaces with many optional fields
- Components that do too many things
- Premature abstraction (wait until you need it 3 times)

### Form Layout Conventions

**Label Spacing:**

Always add `mb-2` (margin-bottom: 0.5rem) to all `<Label>` components for consistent spacing between labels and input fields.

```tsx
// ✅ Good - consistent spacing
<div>
  <Label htmlFor="name" className="mb-2">
    Nombre *
  </Label>
  <Input id="name" name="name" />
</div>

// ❌ Bad - no spacing, label touches input
<div>
  <Label htmlFor="name">Nombre *</Label>
  <Input id="name" name="name" />
</div>
```

**Why:** Improves readability and visual hierarchy in forms. Makes it easier to distinguish between the label and the input field.

**Apply to:**
- All form inputs (text, number, email, etc.)
- Select dropdowns
- Textareas
- Any component preceded by a Label

## Routing

**Structure:**
```tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<RootRedirect />} />
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Layout>
            <DashboardPage />
          </Layout>
        </ProtectedRoute>
      }
    />
  </Routes>
</BrowserRouter>
```

**Protected Routes:**

Always wrap authenticated routes with `<ProtectedRoute>`:

```tsx
<Route
  path="/users"
  element={
    <ProtectedRoute>
      <Layout>
        <UsersPage />
      </Layout>
    </ProtectedRoute>
  }
/>
```

## Code Conventions

### TypeScript

**Strict typing, minimal any:**

```typescript
// ✅ Good - explicit types
interface User {
  id: string
  email: string
  role: UserRole
  fullName: string | null
}

// ❌ Bad - using any
const user: any = await getUser()
```

**Use type inference where appropriate:**

```typescript
// ✅ Good - inference works
const [count, setCount] = useState(0)

// ❌ Bad - unnecessary type annotation
const [count, setCount] = useState<number>(0)
```

### Naming Conventions

**Components:** PascalCase
```typescript
export const UserMenu = () => { ... }
```

**Hooks:** camelCase starting with "use"
```typescript
export const useAuth = () => { ... }
```

**Services:** camelCase objects with methods
```typescript
export const authService = {
  signIn: async () => { ... },
  signOut: async () => { ... },
}
```

**Stores:** camelCase starting with "use"
```typescript
export const useAuthStore = create(...)
export const useUIStore = create(...)
```

### File Organization

**One component per file:**
```
components/
├── Header.tsx
├── Navigation.tsx
├── UserMenu.tsx
└── ui/
    ├── button.tsx
    ├── card.tsx
    └── input.tsx
```

**Co-locate related files:**
```
pages/
├── LoginPage.tsx
├── DashboardPage.tsx
└── UsersPage.tsx
```

## Error Handling

**Simple inline errors for forms:**

```tsx
{error && (
  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
    {error}
  </div>
)}
```

**Global error boundary for crashes:**

Application has an ErrorBoundary component that catches rendering errors. Keep it simple - just show a friendly message and reload option.

**Don't:**
- Add complex error tracking (Sentry, etc.) - YAGNI for 10 users
- Create elaborate error handling abstractions
- Log errors to external services (just console.error is fine)

## Environment Variables

**Required variables in `.env`:**

```bash
VITE_API_URL=http://localhost:8080/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-key-here
```

**Usage:**
```typescript
import { config } from '@/config'

const response = await axios.get(`${config.apiUrl}/users`)
```

**Always:**
- Prefix with `VITE_` (required by Vite)
- Validate in `src/config.ts` on startup
- Use descriptive names (e.g., `PUBLISHABLE_DEFAULT_KEY` not `ANON_KEY`)

## Testing Strategy

**Current approach:** Minimal testing for small scale

**What to test:**
- Critical auth flows (when issues arise)
- Complex business logic (when added)

**What NOT to test (YAGNI):**
- Simple components
- UI interactions
- E2E tests
- Coverage metrics

**If you add tests later:**
- Use Vitest (comes with Vite)
- Test user behavior, not implementation details
- Keep tests simple and maintainable

## Common Patterns

### Fetching Data

```tsx
const [data, setData] = useState<User[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${config.apiUrl}/users`)
      setData(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [])
```

**Don't:**
- Add React Query or SWR - YAGNI for small datasets
- Implement complex caching strategies
- Create data fetching abstractions

### Form Handling

Keep it simple with controlled components:

```tsx
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  await authService.signIn(email, password)
}

return (
  <form onSubmit={handleSubmit}>
    <input value={email} onChange={(e) => setEmail(e.target.value)} />
    <input value={password} onChange={(e) => setPassword(e.target.value)} />
    <button type="submit">Iniciar sesión</button>
  </form>
)
```

**Don't:**
- Add react-hook-form or Formik - YAGNI for simple forms
- Create complex validation schemas (Zod, Yup, etc.)
- Abstract form state into custom hooks

## Anti-Patterns to Avoid

❌ **Don't add unnecessary abstractions**
```tsx
// Bad - premature abstraction
const useDataFetch = <T,>(url: string) => { ... }

// Good - just fetch data directly in the component
useEffect(() => {
  fetchUsers()
}, [])
```

❌ **Don't over-optimize**
```tsx
// Bad - unnecessary memoization
const expensiveCalculation = useMemo(() => user.fullName || user.email, [user])

// Good - just compute it
const displayName = user.fullName || user.email
```

❌ **Don't create "just in case" features**
```tsx
// Bad - pagination for 5 users
<Pagination currentPage={page} totalPages={Math.ceil(users.length / 10)} />

// Good - just show all users
<ul>{users.map(user => <UserItem key={user.id} user={user} />)}</ul>
```

❌ **Don't use complex state management patterns**
```tsx
// Bad - Redux-style actions
dispatch({ type: 'SET_USER', payload: user })

// Good - direct state updates with Zustand
useAuthStore.getState().setUser(user)
```

## Build & Deployment

**Development:**
```bash
pnpm dev          # Start dev server (http://localhost:5173)
pnpm build        # Type check and build for production
pnpm preview      # Preview production build locally
```

**Production Build:**
- Output: `dist/` directory
- Optimized and minified
- Deploy to any static hosting (Vercel, Netlify, etc.)

**Environment Setup:**
1. Copy `.env.example` to `.env`
2. Fill in Supabase credentials
3. Set API URL for backend

## When to Update This Document

Update this CLAUDE.md when you:
- Make architectural decisions (new patterns, libraries)
- Change the tech stack
- Add new conventions or guidelines
- Discover anti-patterns to avoid
- Add new environment variables
- Change the project structure

---

Last Updated: 2026-04-02
Created during initial setup with Claude Sonnet 4.5
