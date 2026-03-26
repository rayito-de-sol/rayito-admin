## Context

The backend store management API provides CRUD operations for third-party stores at `/api/v1/stores`. The frontend needs a complete admin interface for managing these stores. The rayito-admin codebase follows a simple, direct approach with no complex state management, using React + TypeScript, shadcn/ui components, Axios for HTTP, and Zustand only where needed.

**Current State:**
- Backend endpoints ready: POST /stores, GET /stores, GET /stores/:id, PATCH /stores/:id
- Store model includes nested structures: Address and CollectionDocConfig
- No existing store management UI
- Existing patterns established for simple CRUD pages (users management)

**Constraints:**
- Small scale system (max 10 stores expected)
- No pagination needed
- Keep implementation simple (per CLAUDE.md guidelines)
- Spanish language for all UI text
- Must work within existing auth/routing structure

## Goals / Non-Goals

**Goals:**
- Create complete CRUD interface for stores following rayito-admin patterns
- Support all Store model fields including nested structures
- Provide clear validation feedback for required fields and formats
- Handle API errors gracefully with Spanish error messages
- Maintain consistency with existing admin UI design and components

**Non-Goals:**
- Pagination or advanced filtering (dataset too small)
- Complex state management (Zustand) for stores - use local component state
- Real-time updates or WebSocket integration
- Bulk operations (import/export)
- Store analytics or reporting
- Multi-step wizard UI (keep form simple, single page)

## Decisions

### 1. Component Architecture: Single Page with Modal/Inline Forms

**Decision:** Use a single StoresPage with conditional rendering for list/create/edit/detail views, rather than separate routes for each operation.

**Rationale:**
- Simpler navigation flow for small dataset
- Faster interactions (no route changes for create/edit)
- Consistent with small-scale philosophy
- Easier state management (keep data in parent component)

**Alternatives Considered:**
- Separate routes (/tiendas, /tiendas/nuevo, /tiendas/:id) - Rejected: Over-engineered for <10 stores, adds unnecessary routing complexity

### 2. State Management: Local Component State Only

**Decision:** Use React useState in components, no Zustand store for stores data. Fetch fresh data after mutations.

**Rationale:**
- Stores data is not needed across multiple unrelated components
- Small dataset makes refetching cheap
- Simpler than managing global cache invalidation
- Aligns with YAGNI principle from CLAUDE.md

**Alternatives Considered:**
- Zustand store for stores - Rejected: Unnecessary for single-page CRUD
- React Query/SWR - Rejected: Adds dependency, overkill for small scale

### 3. Form Handling: Controlled Components with Manual Validation

**Decision:** Use controlled inputs (useState) with manual validation on submit, no form library.

**Rationale:**
- Follows existing pattern in rayito-admin (see LoginPage)
- No react-hook-form or Formik per CLAUDE.md anti-patterns
- Form complexity is manageable (15-20 fields grouped in sections)
- Full control over validation messages in Spanish

**Alternatives Considered:**
- react-hook-form - Rejected: Per CLAUDE.md "Don't add react-hook-form or Formik - YAGNI for simple forms"

### 4. Form Layout: Sectioned Form with Visual Grouping

**Decision:** Group form fields into logical sections (Identity, Address, Contact, Configuration) using Card components for visual separation.

**Rationale:**
- Improves UX for 15+ field form
- Matches backend data structure (Store, Address, CollectionDocConfig)
- Easy to understand and maintain
- Uses existing shadcn/ui Card component

### 5. API Integration: Dedicated Service Layer

**Decision:** Create `src/services/stores.ts` with functions for each API operation (listStores, getStore, createStore, updateStore).

**Rationale:**
- Consistent with existing auth service pattern
- Centralizes API URL construction and error handling
- Easy to mock for testing if needed later
- Keeps components focused on UI logic

### 6. Type Definitions: Mirror Backend Domain Models

**Decision:** Create TypeScript interfaces in `src/types/store.ts` that exactly match backend domain.Store, domain.Address, domain.CollectionDocConfig structures.

**Rationale:**
- Type safety for API requests/responses
- Self-documenting code
- Easier refactoring if backend changes
- Catches type mismatches at compile time

### 7. Validation Strategy: Client + Server Validation

**Decision:** Implement client-side validation for format/required fields, rely on server for business rules (duplicate identity).

**Client Validates:**
- Required fields
- Email format
- Discount percentage range (0-100)
- Identity type enum values

**Server Handles:**
- Duplicate identity number
- Authorization (role-based)
- Data consistency

**Rationale:**
- Better UX with immediate feedback
- Server remains source of truth for business rules
- Avoids duplicating complex validation logic

### 8. Error Handling: Inline Error Messages + Toast for Success

**Decision:** Display validation errors inline below fields, show success/error toasts for API operations.

**Rationale:**
- Clear association between error and field
- Follows standard form UX patterns
- Success toasts provide confirmation without blocking UI

**Alternatives Considered:**
- Error boundary only - Rejected: Too coarse-grained for form validation
- Global error banner - Rejected: Less clear than inline errors

## Risks / Trade-offs

**Risk: Large form may be overwhelming**
→ Mitigation: Use sectioned layout with clear headings, optional fields clearly marked

**Risk: No optimistic updates may feel slow**
→ Mitigation: Show loading states, dataset is small so refetch is fast, acceptable for small scale

**Risk: Manual validation may become complex as fields grow**
→ Mitigation: Keep validation functions focused, document validation rules in comments, current field count (15-20) is still manageable

**Trade-off: Single page vs separate routes**
→ Chosen simplicity over URL-based navigation, acceptable because user base is small and stores list fits on one screen

**Trade-off: No real-time sync between users**
→ Acceptable for 2-5 employee scale, extremely rare concurrent edits, refetch on focus if needed later

## Migration Plan

N/A - This is a new feature with no existing data or UI to migrate.

## Open Questions

None - Implementation is straightforward CRUD with existing backend API.
