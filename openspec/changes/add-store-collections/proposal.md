# Proposal: Add Store Collections Management

## Why

Currently, there's no way to create or view collection documents ("Cuentas de Cobro") for stores through the admin interface, despite the backend API supporting full CRUD operations. This creates a critical gap in functionality, forcing store managers to handle billing documentation outside the system. Adding collection management directly into the store detail page will streamline document creation, centralize collection tracking, and reduce manual work for store managers managing billing workflows.

## What Changes

- **Collection creation modal**: Add a modal interface to create new collection documents with product variant selection, quantity input, and pricing display (calculated by backend)
- **Collections table**: Display all collections for a store with filtering by state, sortable columns, PDF links, and state management actions
- **State management**: Implement collection state transitions (draft → active → paid/cancelled) with validation and user prompts
- **Google Drive integration**: Link generated PDF documents directly from the collections table
- **Store detail page enhancement**: Integrate collections section below existing store details
- **Form validation**: Implement client-side validation for collection items, quantities, notes, and payment due dates
- **Pricing display**: Show pricing breakdowns (subtotal, discounts, VAT, total) from backend calculations

## Capabilities

### New Capabilities

- `collection-creation`: Creating new collection documents with product variant selection, quantity input, pricing display from backend, optional metadata (notes, payment due date), and form validation
- `collection-list-view`: Viewing and filtering collections for a store with table display, state filtering, sorting, PDF access, and empty/loading/error states
- `collection-state-management`: Managing collection lifecycle states (draft, active, paid, cancelled) with state transition validation, action prompts, and immediate UI updates

### Modified Capabilities

<!-- No existing capabilities are being modified at the requirements level -->

## Impact

**Affected Files**:
- `src/pages/stores/[id].tsx` - Store detail page (add collections section)
- New directory: `src/features/collections/` with components, hooks, API client, types, and store

**New Dependencies**:
- None required - uses existing stack (React, TypeScript, Zustand, Axios, shadcn/ui, Tailwind)

**API Integration**:
- Backend collections API endpoints (already implemented):
  - `GET /collections` - List collections with filters
  - `POST /collections` - Create collection (draft, backend calculates pricing)
  - `GET /collections/:id` - Get collection details
  - `PUT /collections/:id/items` - Update items (draft only, backend recalculates)
  - `PATCH /collections/:id` - Update metadata (draft only)
  - `POST /collections/:id/finalize` - Finalize and generate PDF
  - `PATCH /collections/:id/state` - Update collection state

**Backend Pricing Logic** (reference only, frontend displays results):
- Calculations handled by `collection_service.go`
- Formula: `(variant_price - discount) / 1.19` if VAT deducted
- Uses store's discount percentage and VAT settings
- Frontend sends variant IDs + quantities, receives calculated prices

**User Impact**:
- Store managers gain ability to create and manage billing documents directly in the admin interface
- Improved workflow efficiency for collection creation and tracking
- Centralized access to collection history and PDF documents
