# Design: Store Collections Management

## Context

The Rayito admin frontend is a React + TypeScript application that follows the "simplicity first" principle outlined in the project's CLAUDE.md guidelines. The backend API already has full CRUD operations for collections (`internal/services/collection_service.go`), including pricing calculations, PDF generation, and state management.

**Current Stack**:
- React 18.3 + TypeScript 5.7
- Zustand (lightweight state management)
- Axios (HTTP client)
- shadcn/ui (component library)
- Tailwind CSS v4

**Existing Patterns**:
- Feature-based folder structure for domain features
- Page components in `src/pages/`
- Zustand stores for local state
- API clients in service files
- Form validation with controlled components

**Backend API** (already implemented):
- `POST /collections` - Creates draft with server-calculated pricing
- `GET /collections?store_id=X&state=Y` - Lists with filters
- `PATCH /collections/:id/state` - State transitions
- `POST /collections/:id/finalize` - Generates PDF on Google Drive

**Constraints**:
- Small scale (2-5 employees, <10 users)
- No pagination needed
- Keep complexity minimal (YAGNI)
- All Spanish UI text

## Goals / Non-Goals

**Goals**:
- Enable collection creation from store detail page
- Display collections table with filtering and state management
- Link to Google Drive PDFs
- Validate client-side before submission
- Match backend state transition rules
- Reuse existing patterns and components

**Non-Goals**:
- Pagination (dataset is small)
- Real-time pricing calculations (backend handles this)
- Complex state management (no Redux/Context)
- Inline editing (use modal for creation/updates)
- Offline support or optimistic updates
- Search/advanced filtering (state filter is sufficient)

## Decisions

### 1. Feature-Based Folder Structure

**Decision**: Create `src/features/collections/` with subfolders for components, hooks, API, types, and store.

**Rationale**:
- Matches existing pattern for domain features
- Co-locates related code
- Easy to find and maintain
- Follows CLAUDE.md guidelines

**Alternatives Considered**:
- Flat structure in `src/components/` - Rejected: Would scatter collection-related code
- Mix with stores feature - Rejected: Collections is a distinct capability

**Structure**:
```
src/features/collections/
├── components/
│   ├── CreateCollectionModal.tsx
│   ├── CollectionsTable.tsx
│   ├── CollectionStateBadge.tsx
│   ├── ProductSelector.tsx
│   └── index.ts
├── hooks/
│   ├── useCollections.ts
│   ├── useCreateCollection.ts
│   └── index.ts
├── api/
│   └── collectionsApi.ts
├── types/
│   └── collection.types.ts
└── store/
    └── collectionsStore.ts
```

### 2. Zustand Store for Collections State

**Decision**: Use a simple Zustand store to hold collections list, loading state, and errors.

**Rationale**:
- Matches existing state management pattern (useAuthStore, etc.)
- Lightweight and simple (YAGNI)
- Easy to update from API responses
- No complex middleware needed

**Alternatives Considered**:
- React Query/SWR - Rejected: Overkill for small dataset, adds dependency
- Component-level useState - Rejected: State needs to be shared across table and modal
- Context API - Rejected: Zustand is already established pattern

**Store Shape**:
```typescript
interface CollectionsState {
  collections: Collection[];
  isLoading: boolean;
  error: string | null;
  setCollections: (collections: Collection[]) => void;
  addCollection: (collection: Collection) => void;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  // ... simple setters
}
```

### 3. Modal for Collection Creation

**Decision**: Use shadcn/ui Dialog component for creation modal with controlled form inputs.

**Rationale**:
- Follows existing pattern (user creation, store creation)
- shadcn/ui Dialog is already in use
- Keeps store detail page clean
- Form validation in modal scope

**Alternatives Considered**:
- Inline form on page - Rejected: Would clutter store detail page
- Separate page/route - Rejected: Adds unnecessary navigation, breaks workflow
- Drawer component - Rejected: Modal is established pattern in codebase

**Modal Features**:
- Product variant selector (combobox)
- Quantity inputs
- Optional notes and payment due date
- Pricing summary (from backend response preview)
- Client-side validation before submission

### 4. Table Display with Filtering

**Decision**: Use shadcn/ui Table component with state filter dropdown.

**Rationale**:
- Matches existing table patterns (products, users)
- Simple state filter dropdown is sufficient
- No pagination needed (small dataset)
- Sortable by date/number

**Alternatives Considered**:
- Card/list view - Rejected: Table is more compact and scannable
- Advanced filtering - Rejected: YAGNI, state filter is enough
- Pagination - Rejected: Dataset is small (<100 collections per store)

**Table Columns**:
- Collection Number (sortable)
- Date Created (sortable)
- Total Price (Colombian COP format)
- State Badge (color-coded)
- PDF Link (Google Drive)
- Actions Dropdown (finalize, update state, cancel)

### 5. Backend-Driven Pricing

**Decision**: Frontend displays pricing from backend responses, does not calculate locally.

**Rationale**:
- Backend already has pricing logic (`calculateItemPricing`, `calculateCollectionTotals`)
- Avoids duplicate logic and drift
- Backend uses store settings (discount %, VAT deduction)
- Single source of truth

**Alternatives Considered**:
- Client-side calculation - Rejected: Duplicate logic, risk of inconsistency
- Preview calculation endpoint - Rejected: YAGNI, just submit and display result

**Implementation**:
- User selects variants + quantities
- On submit, POST to `/collections`
- Backend calculates and returns full collection with pricing
- Frontend displays the result

### 6. Google Drive PDF Links

**Decision**: Construct Google Drive URLs from `document_id` field in collection response.

**Rationale**:
- Backend stores `document_id` after PDF generation
- Standard Google Drive URL format: `https://drive.google.com/file/d/{documentId}/view`
- Opens in new tab with proper sharing

**Alternatives Considered**:
- Download proxy endpoint - Rejected: Adds backend complexity, Google Drive works
- Embed viewer - Rejected: Overkill, external link is simpler

**Implementation**:
```typescript
function getGoogleDriveUrl(documentId: string): string {
  return `https://drive.google.com/file/d/${documentId}/view`;
}
```

### 7. State Transition Validation

**Decision**: Mirror backend state machine rules in frontend for instant feedback.

**Rationale**:
- Backend has strict transition rules (`canTransitionState` function)
- Frontend can disable invalid actions
- Better UX (no failed requests for obvious violations)

**State Machine** (from backend):
```
draft → [active, cancelled]
active → [paid, cancelled]
paid → (terminal)
cancelled → (terminal)
```

**Implementation**:
- State badge shows current state with color coding
- Actions dropdown only shows valid transitions
- Prompts for required fields (payment method, cancel reason)

## Risks / Trade-offs

### Risk: Google Drive Access Permissions

**Risk**: Users may not have access to the Google Drive folder where PDFs are stored.

**Mitigation**:
- Backend should grant view access when uploading PDF
- Frontend shows helpful error if link fails to load
- Document this in user onboarding

### Risk: State Transition Conflicts

**Risk**: Two users might try to transition the same collection simultaneously.

**Mitigation**:
- Backend validates current state before transitions
- Frontend refetches after failed state update
- Toast notification shows error message
- For this scale (<10 users), unlikely to occur frequently

### Risk: Large Collections (Many Items)

**Risk**: Collections with 50+ items might slow down the UI.

**Mitigation**:
- Backend validates reasonable item limits
- Frontend uses virtualized list if needed (defer until needed)
- Current scope: Assume <20 items per collection (typical for small stores)

### Trade-off: No Optimistic Updates

**Decision**: Wait for backend confirmation before updating UI.

**Rationale**:
- Simpler implementation
- Backend does calculations, can't predict result
- Small scale means latency is acceptable
- Less risk of UI drift

### Trade-off: No Inline Editing

**Decision**: Use modal for creation, actions for state changes (no inline row editing).

**Rationale**:
- Simpler implementation
- Collections in draft can be edited via separate modal
- Active/paid/cancelled are immutable (only state transitions)
- Matches existing patterns

## Migration Plan

**Deployment Steps**:
1. Deploy frontend code (no backend changes needed)
2. Verify collections section appears on store detail page
3. Test creation flow end-to-end
4. Test state transitions
5. Verify PDF links work

**Rollback Strategy**:
- Frontend-only change, safe to rollback by deploying previous version
- No database migrations needed
- Backend API remains unchanged

## Open Questions

None - all technical decisions are clear and aligned with existing patterns.
