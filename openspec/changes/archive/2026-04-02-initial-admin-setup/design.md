## Context

This is the initial setup of the rayito-admin frontend application. The backend API (rayito-api) already exists in Go with JWT authentication via Supabase, user management, and RESTful endpoints. The frontend needs to integrate with this existing infrastructure while maintaining the project's core philosophy: simplicity over scalability, optimized for 2-5 employees and max 10 users.

**Constraints:**
- Free-tier deployment (Netlify/Vercel)
- Small user base (<10 users total)
- Single factory operations (no multi-tenancy)
- Must integrate with existing rayito-api backend
- Supabase handles authentication (signup/signin UI components from Supabase)

## Goals / Non-Goals

**Goals:**
- Establish maintainable React/TypeScript codebase with clear patterns
- Implement secure authentication flow using Supabase JWT tokens
- Create type-safe API client for backend communication
- Set up development environment with hot reload and code quality tools
- Define folder structure and conventions for future feature development
- Keep implementation simple and straightforward (no over-engineering)

**Non-Goals:**
- Complex state management libraries (Redux, MobX) - use Zustand for lightweight state
- Server-side rendering or advanced performance optimizations
- Microfront ends or module federation
- Offline-first capabilities or complex caching strategies
- Multi-tenancy or role-based UI variations (roles exist, but UI differences are minimal)
- Internationalization (i18n) - Spanish only
- User management features in initial setup - focus on auth + empty dashboard first

## Decisions

### 1. Build Tool: Vite

**Decision:** Use Vite as the build tool and dev server.

**Rationale:**
- Fast hot module replacement for development
- Modern ESM-based approach with minimal configuration
- Official React + TypeScript template available
- Smaller bundle sizes compared to Create React App
- Active maintenance and growing ecosystem

**Alternatives Considered:**
- Create React App: Outdated, slower, more complex configuration
- Next.js: Overkill for simple SPA, adds SSR complexity not needed
- Webpack from scratch: Too much configuration overhead

### 2. Package Manager: pnpm

**Decision:** Use pnpm for dependency management.

**Rationale:**
- Efficient disk space usage (content-addressable storage)
- Faster installs than npm/yarn
- Strict dependency resolution prevents phantom dependencies
- Growing adoption in modern projects

**Configuration:**
- Use `.npmrc` to enforce pnpm usage and set registry options

### 3. State Management: Zustand

**Decision:** Use Zustand for lightweight global state management.

**Rationale:**
- Minimal boilerplate compared to Redux or Context API
- Small bundle size (~1kb)
- Simple, hook-based API
- No providers needed, works outside React components
- Perfect for our small-scale needs (auth state, loading states)

**Stores:**
- `useAuthStore`: User session state, login/logout actions
- `useUIStore`: Global loading spinner, error states

**Alternatives Considered:**
- React Context: Works but more boilerplate, potential re-render issues
- Redux: Massive overkill for our scale
- Jotai/Recoil: More complex atoms pattern not needed

### 4. Authentication: Supabase Client Library

**Decision:** Use `@supabase/supabase-js` for authentication with localStorage token persistence, managed via Zustand store.

**Rationale:**
- Backend already uses Supabase for auth
- Client library handles token refresh automatically
- Built-in session management and storage
- Simple API: `signIn()`, `signOut()`, `onAuthStateChange()`
- Zustand stores auth state globally for easy access

**Flow:**
1. User signs in via Supabase UI component → JWT token stored in localStorage by Supabase
2. Zustand store (`useAuthStore`) subscribes to Supabase `onAuthStateChange()`, updates user state
3. Protected routes read auth state from Zustand store, redirect to `/login` if unauthenticated
4. API client reads token from Supabase session, injects in `Authorization` header

**Alternatives Considered:**
- Manual JWT handling: More complex, duplicates Supabase client functionality
- Third-party auth library (Auth0, Clerk): Adds cost, unnecessary for our scale

### 5. API Client: Axios with Interceptors

**Decision:** Use Axios with request/response interceptors for API communication.

**Rationale:**
- Clean interceptor pattern for token injection
- Built-in request/response transformation
- Better error handling than native fetch
- Timeout configuration built-in
- TypeScript-friendly

**Implementation Pattern:**
```
src/services/api/
├── client.ts          # Axios instance with interceptors
├── types.ts           # Shared API types
└── endpoints/
    └── users.ts       # User-related API calls
```

**Alternatives Considered:**
- Native fetch: Requires more boilerplate for interceptors and error handling
- React Query: Adds complexity for simple CRUD operations at our scale
- tRPC: Requires backend changes, overkill for RESTful API

### 6. Routing: React Router v6

**Decision:** Use React Router v6 for client-side routing with protected route wrapper.

**Rationale:**
- Industry standard for React SPAs
- Declarative routing matches React patterns
- Built-in hooks (`useNavigate`, `useParams`, `useLocation`)
- Support for nested routes and layout routes

**Route Protection Strategy:**
- Create `<ProtectedRoute>` wrapper component
- Check auth state from `AuthContext`
- Redirect to `/login` if not authenticated
- Pass children through if authenticated

**Alternatives Considered:**
- TanStack Router: Too new, smaller ecosystem
- Reach Router: Deprecated in favor of React Router
- Wouter: Too minimal, missing features we'll need

### 7. Project Structure: Feature-Based Organization

**Decision:** Use a hybrid structure: shared infrastructure in `src/`, features when they emerge.

**Initial Structure:**
```
src/
├── components/        # Shared UI components (shadcn components)
│   └── ui/           # shadcn component library
├── stores/            # Zustand stores (useAuthStore, useUIStore)
├── hooks/             # Custom hooks (useAuth, useApi)
├── pages/             # Route-level components (LoginPage, DashboardPage)
├── services/          # External integrations (API client, Supabase)
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── lib/               # shadcn utilities (cn function, etc.)
├── App.tsx            # Root component with routing and error boundary
├── main.tsx           # Entry point
└── config.ts          # Environment variables and config
```

**As features grow, migrate to:**
```
src/
├── features/
│   └── users/
│       ├── components/
│       ├── hooks/
│       └── api.ts
```

**Rationale:**
- Simple structure to start, easy to understand
- Colocate related code as features emerge
- Shared code remains accessible
- Aligns with "simple first" philosophy

**Alternatives Considered:**
- Feature-based from start: Premature for initial setup
- Flat structure: Doesn't scale beyond 20-30 files

### 8. UI Components: shadcn/ui + Tailwind CSS

**Decision:** Use shadcn/ui component library with Tailwind CSS for styling.

**Rationale:**
- Copy-paste components (not npm package) - full control over code
- Built on Radix UI primitives - accessible by default
- Tailwind CSS for styling - utility-first approach
- Customizable and themeable via CSS variables
- Includes common components (Button, Input, Dialog, etc.)
- No runtime overhead, tree-shakeable
- Fast development with pre-built, accessible components

**Setup:**
- Install shadcn CLI and initialize with default theme
- Components copied to `src/components/ui/`
- Tailwind config extended with shadcn theme
- Use `cn()` utility for className merging

**Configuration:**
- Use default shadcn theme (neutral gray scale)
- Customize primary color in `tailwind.config.js` if needed
- Purge unused Tailwind styles in production

**Alternatives Considered:**
- Material UI: Heavy bundle, opinionated design
- Ant Design: Not tree-shakeable, large bundle
- Chakra UI: Runtime CSS-in-JS overhead
- Headless UI: More manual styling work
- Plain Tailwind: Need to build all components from scratch

### 9. Code Quality: ESLint + Prettier

**Decision:** Use ESLint for linting and Prettier for formatting with standard configs.

**Configuration:**
- ESLint: `@typescript-eslint`, `eslint-plugin-react-hooks`
- Prettier: Default config with minor adjustments (single quotes, 2-space indent)
- Pre-commit hooks via `husky` + `lint-staged` (simple, no complex tooling)

**Rationale:**
- Catch bugs and enforce conventions automatically
- Consistent code style across contributors
- Standard configs minimize bikeshedding

### 10. Environment Variables: Vite env Pattern

**Decision:** Use Vite's built-in environment variable system with `.env` files.

**Pattern:**
- `.env.local` for local development (gitignored)
- `.env.example` as template
- Prefix variables with `VITE_` for client exposure
- Access via `import.meta.env.VITE_*`

**Required Variables:**
```
VITE_API_URL=http://localhost:8080/api/v1
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=xxx
```

**Rationale:**
- Vite native pattern, no additional libraries
- Type-safe access with `ImportMetaEnv` interface extension
- Prevents accidental secret exposure (must prefix with `VITE_`)

## Risks / Trade-offs

**[Risk] Supabase client library bundle size (~100kb)**
→ **Mitigation:** Acceptable for our scale; modern bundlers tree-shake unused features

**[Risk] Axios adds dependency weight vs native fetch**
→ **Mitigation:** ~15kb gzipped is negligible; developer experience and maintainability benefits outweigh size

**[Risk] shadcn/ui components copied into codebase - harder to update**
→ **Mitigation:** Accept this trade-off for full control; updates are manual but allow customization. Component updates are infrequent.

**[Risk] Tailwind CSS + shadcn requires learning curve for team**
→ **Mitigation:** Extensive documentation, IntelliSense support, and high adoption make onboarding straightforward. shadcn provides examples.

**[Risk] Zustand has smaller ecosystem than Redux**
→ **Mitigation:** Our state needs are simple; Zustand's small API surface is sufficient. Can migrate to Redux if complexity grows (unlikely).

**[Risk] localStorage for token storage vulnerable to XSS**
→ **Mitigation:** Supabase uses httpOnly cookies when possible; for SPA, localStorage is standard practice. We rely on React's built-in XSS protections and CSP headers at deployment

**[Trade-off] No server-side rendering means slower initial page load**
→ **Acceptable:** For internal tool with <10 users, SPA simplicity outweighs marginal performance gains from SSR

**[Risk] Free-tier deployment limits (build minutes, bandwidth)**
→ **Mitigation:** Monitor usage, optimize bundle size, use CDN for assets. Both Netlify and Vercel have generous free tiers

## Migration Plan

**Deployment Steps:**
1. Create Netlify or Vercel project linked to git repository
2. Configure build command: `pnpm build`
3. Set output directory: `dist`
4. Add environment variables in hosting platform dashboard
5. Configure redirect rules for SPA (all routes → `index.html`)
6. Enable HTTPS (automatic on both platforms)

**Rollback Strategy:**
- Git revert commit and re-deploy previous version
- Hosting platforms keep previous deployments, can roll back via dashboard

**Initial Release:**
- Deploy to production once authentication and basic layout are functional
- Share URL with initial user for feedback
- No complex staging environment needed for our scale

## Open Questions

~~1. **User management UI scope:** Should initial setup include user list/edit pages, or just authentication + empty dashboard?~~
   - **Decision:** Authentication + empty dashboard only. User management comes later as a separate feature.

~~2. **Error boundary strategy:** Should we add global error boundary now or wait for more components?~~
   - **Decision:** Add simple error boundary in initial setup to catch rendering errors gracefully.

~~3. **Loading states:** Centralized loading spinner or per-component loaders?~~
   - **Decision:** Centralized loading spinner managed via Zustand `useUIStore`.

~~4. **API error handling:** Toast notifications, inline errors, or modal dialogs?~~
   - **Decision:** Start with inline errors. Toast library can be added later if needed.

**All questions resolved - ready to proceed with implementation.**
