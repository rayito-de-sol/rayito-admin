## ADDED Requirements

### Requirement: System organizes code in standard directory structure
The system SHALL follow a consistent folder structure that separates concerns and makes code discoverable.

#### Scenario: Source code organized in src directory
- **WHEN** developer looks for application code
- **THEN** all application code resides in `src/` directory

#### Scenario: Components organized by type
- **WHEN** developer looks for UI components
- **THEN** shared components are in `src/components/` and shadcn components in `src/components/ui/`

#### Scenario: Pages organized separately from components
- **WHEN** developer looks for route-level pages
- **THEN** page components are in `src/pages/` directory

#### Scenario: Services isolated from UI
- **WHEN** developer looks for API client or Supabase integration
- **THEN** service modules are in `src/services/` directory

#### Scenario: Zustand stores colocated
- **WHEN** developer looks for global state stores
- **THEN** store definitions are in `src/stores/` directory

### Requirement: System uses TypeScript for type safety
The system SHALL use TypeScript for all source files with strict type checking enabled.

#### Scenario: All source files use TypeScript
- **WHEN** developer creates a new file
- **THEN** file extension is `.ts` for modules or `.tsx` for React components

#### Scenario: Strict mode enabled
- **WHEN** TypeScript compiles the project
- **THEN** compiler enforces strict null checks, noImplicitAny, and other strict flags

#### Scenario: Type definitions centralized
- **WHEN** developer needs shared type definitions
- **THEN** types are defined in `src/types/` directory

### Requirement: System uses pnpm as package manager
The system SHALL use pnpm for installing and managing dependencies.

#### Scenario: Dependencies installed with pnpm
- **WHEN** developer runs install command
- **THEN** pnpm installs packages and generates `pnpm-lock.yaml`

#### Scenario: npm/yarn usage prevented
- **WHEN** developer accidentally runs `npm install` or `yarn install`
- **THEN** `.npmrc` configuration prevents installation and shows error

#### Scenario: Workspace configured for monorepo compatibility
- **WHEN** project structure expands
- **THEN** pnpm workspace configuration is ready in root `pnpm-workspace.yaml` if needed

### Requirement: System uses Vite for development and build
The system SHALL use Vite as the build tool and development server.

#### Scenario: Development server starts quickly
- **WHEN** developer runs `pnpm dev`
- **THEN** Vite starts dev server with hot module replacement (HMR) in under 3 seconds

#### Scenario: Production build optimized
- **WHEN** developer runs `pnpm build`
- **THEN** Vite generates optimized bundle in `dist/` directory with code splitting and minification

#### Scenario: Environment variables loaded
- **WHEN** application accesses `import.meta.env.VITE_*`
- **THEN** Vite loads values from `.env.local` or `.env` file

### Requirement: System enforces code quality with linting
The system SHALL use ESLint to catch errors and enforce coding standards.

#### Scenario: Linting runs on save
- **WHEN** developer saves a file in VS Code
- **THEN** ESLint automatically checks file and shows errors inline

#### Scenario: Linting runs before build
- **WHEN** developer runs `pnpm lint`
- **THEN** ESLint checks all source files and reports errors

#### Scenario: React hooks rules enforced
- **WHEN** developer writes React hooks incorrectly
- **THEN** ESLint shows error about rules of hooks

### Requirement: System formats code consistently with Prettier
The system SHALL use Prettier to automatically format code.

#### Scenario: Code formatted on save
- **WHEN** developer saves a file in VS Code
- **THEN** Prettier automatically formats code according to configuration

#### Scenario: Format command available
- **WHEN** developer runs `pnpm format`
- **THEN** Prettier formats all source files

#### Scenario: Consistent formatting across team
- **WHEN** multiple developers work on the codebase
- **THEN** Prettier configuration ensures consistent style (indentation, quotes, semicolons)

### Requirement: System provides development scripts in package.json
The system SHALL define npm scripts for common development tasks.

#### Scenario: Start development server
- **WHEN** developer runs `pnpm dev`
- **THEN** Vite starts dev server on http://localhost:5173

#### Scenario: Build for production
- **WHEN** developer runs `pnpm build`
- **THEN** Vite builds optimized production bundle

#### Scenario: Preview production build
- **WHEN** developer runs `pnpm preview`
- **THEN** Vite serves production build locally for testing

#### Scenario: Run linter
- **WHEN** developer runs `pnpm lint`
- **THEN** ESLint checks all source files

#### Scenario: Format code
- **WHEN** developer runs `pnpm format`
- **THEN** Prettier formats all source files

### Requirement: System configures Git to ignore generated files
The system SHALL use `.gitignore` to prevent committing generated files.

#### Scenario: Dependencies excluded from Git
- **WHEN** developer commits code
- **THEN** `node_modules/` is ignored by Git

#### Scenario: Build artifacts excluded
- **WHEN** developer commits code
- **THEN** `dist/` and build output are ignored by Git

#### Scenario: Local environment files excluded
- **WHEN** developer creates `.env.local`
- **THEN** file is ignored by Git to prevent leaking secrets

#### Scenario: Lock file included
- **WHEN** developer commits code
- **THEN** `pnpm-lock.yaml` is committed to ensure consistent dependencies

### Requirement: System includes README with setup instructions
The system SHALL provide a README.md with clear setup and development instructions.

#### Scenario: New developer can set up project
- **WHEN** new developer clones repository
- **THEN** README contains step-by-step instructions for setup (install pnpm, copy .env, run dev server)

#### Scenario: Available scripts documented
- **WHEN** developer wants to run a command
- **THEN** README lists all available pnpm scripts and their purpose

### Requirement: System uses shadcn/ui for component library
The system SHALL use shadcn/ui components copied into the codebase for UI elements.

#### Scenario: shadcn components in ui folder
- **WHEN** developer looks for shadcn components
- **THEN** components are located in `src/components/ui/` directory

#### Scenario: Components customizable
- **WHEN** developer wants to modify a component
- **THEN** component source code is directly editable in `src/components/ui/`

#### Scenario: New components added via CLI
- **WHEN** developer needs a new shadcn component
- **THEN** developer runs `pnpx shadcn@latest add <component>` to copy it to the project

### Requirement: System provides environment variable template
The system SHALL include `.env.example` file documenting required environment variables.

#### Scenario: Template lists all variables
- **WHEN** developer looks at `.env.example`
- **THEN** file contains all required `VITE_*` variables with example values

#### Scenario: Developer creates local environment file
- **WHEN** developer clones repository
- **THEN** developer copies `.env.example` to `.env.local` and fills in actual values

#### Scenario: Missing required variables cause error
- **WHEN** required environment variable is missing
- **THEN** application throws error at startup with clear message
