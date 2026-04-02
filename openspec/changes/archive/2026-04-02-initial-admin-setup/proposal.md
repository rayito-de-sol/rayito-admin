## Why

The rayito-admin frontend does not exist yet. We need to establish the foundational React/TypeScript application with authentication, API integration, and development tooling to enable building factory management features for 2-5 employees operating on free-tier infrastructure.

## What Changes

- Initialize React + TypeScript application with Vite build tooling in rayito-admin root folder
- Configure pnpm as package manager
- Implement Supabase authentication integration (JWT token management)
- Build API client for communicating with rayito-api backend
- Set up React Router for navigation and protected routes
- Configure development environment (ESLint, Prettier, hot reload)
- Establish project structure and coding conventions aligned with simplicity-first philosophy
- Create basic layout shell (header, navigation, content area)

## Capabilities

### New Capabilities

- `authentication`: Supabase JWT authentication, token storage, session management, and protected route handling
- `api-client`: HTTP client for rayito-api backend with JWT token injection, error handling, and type-safe request/response patterns
- `routing`: React Router setup with public/protected routes, navigation structure, and route guards
- `project-structure`: Folder organization, naming conventions, component patterns, and development tooling configuration

### Modified Capabilities

<!-- No existing capabilities to modify -->

## Impact

**New Files/Directories:**
- React application structure in existing rayito-admin root folder
- Package configuration (`package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `vite.config.ts`)
- Source code directory structure (`src/`, `src/components/`, `src/services/`, etc.)
- Development tooling configs (ESLint, Prettier, `.npmrc` for pnpm)

**Dependencies:**
- React 18+, React Router, TypeScript
- Supabase JS client for authentication
- Axios or Fetch API wrapper for backend communication
- Vite for build tooling
- ESLint, Prettier for code quality

**External Systems:**
- Integrates with existing rayito-api backend (Go service)
- Connects to Supabase authentication service
- Designed for deployment on free-tier hosting (Netlify, Vercel, or similar)
