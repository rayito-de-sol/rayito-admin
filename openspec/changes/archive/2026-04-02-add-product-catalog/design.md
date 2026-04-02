## Context

Rayito Admin currently has no product catalog management interface. The backend API (`rayito-api`) already provides complete REST endpoints for products, variants, sizes, and packages, but there is no UI to consume these endpoints. Factory managers cannot catalog products, track inventory, manage costs, or view product compositions without this frontend implementation.

The backend uses a **package entity system** where packages are reusable entities separate from products. Products optionally reference a package by ID, not by embedding cost amounts. This design allows multiple products to share the same package (e.g., "Bolsa Pequeña" used by several products) and tracks package cost history independently.

The system manages Colombian hair accessories (turbantes, moños, cintillos, diademas) with two product types:
- **Single products**: Individual items with variants (color, size) and optional packaging
- **Set products**: Composed of multiple variants with quantities, computed cost/stock

**Current Codebase State:**
- Existing patterns: `StoresPage.tsx`, `storesService.ts` for CRUD operations
- API client: `apiClient` with JWT interceptor in `src/services/api/client.ts`
- Routing: React Router v6 with protected routes in `App.tsx`
- UI: shadcn/ui components, Tailwind CSS, form state in component state (no form libraries)
- Auth: Supabase JWT tokens via `useAuthStore`

**Constraints:**
- Small scale (max 10 users, single factory)
- No pagination needed (small datasets)
- Spanish-only UI
- Free tier hosting (minimal dependencies)

## Goals / Non-Goals

**Goals:**
- Complete CRUD interface for products with single/set type support
- Variant management with stock, cost, images (multiple per variant, mark primary)
- Size management with product-specific sizes
- Package management section with reusable package entities
- Set product composition UI with computed cost/stock from components
- Cost and price history views showing active vs superseded records
- Authorization controls (admin/manager edit, analyst view-only)
- Follow existing rayito-admin patterns (StoresPage, storesService)
- Integration with all product catalog API endpoints
- Image management UI (display, add, set primary)

**Non-Goals:**
- Image upload to cloud storage (use URL input for now, defer file upload)
- Pagination (small datasets, <100 products expected)
- Real-time updates or WebSocket integration
- Advanced search (basic filtering sufficient)
- Bulk operations (edit one at a time is fine)
- Export/import features
- Product versioning or change history (only cost/price history)
- Multi-tenancy or factory selection (single factory only)

## Decisions

### 1. Component Architecture: Follow Stores Pattern

**Decision:** Use the same page-based architecture as `StoresPage.tsx` with modal forms for create/edit.

**Rationale:**
- Consistency with existing codebase (developers already familiar)
- Works well for small-scale CRUD operations
- Modals keep context visible (don't navigate away from list)
- Simple state management (component state, no Zustand needed)

**Alternatives Considered:**
- ❌ Separate pages for create/edit: Too many routes, breaks flow
- ❌ In-place editing: Complex for nested data (variants, sizes)

**Implementation:**
```
ProductsPage.tsx (list + filters)
  ├─ ProductCard (display product summary)
  ├─ ProductDetailModal (view product, variants, sizes, package)
  │   ├─ VariantCard (display variant with images, stock, cost)
  │   ├─ AddVariantForm (create variant)
  │   ├─ AddSizeForm (create size)
  │   └─ SetCompositionForm (manage set components)
  ├─ ProductCreateModal (create new product)
  └─ ProductEditModal (edit product info)

PackagesPage.tsx (list + inline forms)
  ├─ PackageCard (display package with usage info)
  ├─ PackageCreateForm (create new package)
  └─ PackageEditModal (edit package, update cost)
```

### 2. Service Layer: Separate Services per Resource

**Decision:** Create four service files mirroring API resource boundaries:
- `productService.ts` - Products CRUD, pricing, set computations
- `variantService.ts` - Variants CRUD, stock, cost, cost history
- `sizeService.ts` - Sizes CRUD
- `packageService.ts` - Packages CRUD, cost, cost history

**Rationale:**
- Clear separation of concerns (matches backend API structure)
- Each service handles its resource's error codes
- Easy to mock for testing later
- Follows `storesService.ts` pattern (single export object with methods)

**Alternatives Considered:**
- ❌ Single `catalogService.ts`: Too large, mixes concerns
- ❌ Endpoint files in `api/endpoints/`: Over-engineering for this scale

### 3. Package Selection: Dropdown from GET /packages

**Decision:** Product create/edit forms load packages via `GET /packages` and display a dropdown with "Sin empaque" (no package) option.

**Rationale:**
- Packages are reusable entities (multiple products can share one)
- Dropdown shows all available packages (small dataset, no pagination)
- "Sin empaque" option maps to `package_id: null` in API request
- Package cost is managed in packages section, not in product forms
- Aligns with backend design (products reference packages by ID)

**Alternatives Considered:**
- ❌ Inline cost input: Violates backend design (packages are separate entities)
- ❌ Autocomplete: Over-engineering, dropdown sufficient for <50 packages

**Implementation:**
```typescript
// In ProductCreateForm
const [packages, setPackages] = useState<Package[]>([])
const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)

useEffect(() => {
  packageService.listPackages().then(setPackages)
}, [])

// In form submit
await productService.createProduct({
  ...formData,
  package_id: selectedPackageId, // null if "Sin empaque" selected
})
```

### 4. Image Management: URL Input Only (Defer Upload)

**Decision:** Variant images are managed via URL input fields. No file upload UI in v1.

**Rationale:**
- Backend stores images as JSONB array: `[{ url, alt, is_primary }]`
- File upload requires cloud storage setup (S3, Cloudinary)
- URL input is sufficient for MVP (managers can upload elsewhere first)
- Simplifies implementation (no multipart/form-data, no storage costs)

**Alternatives Considered:**
- ❌ File upload to cloud: Adds complexity, costs, third-party dependency
- ❌ Base64 encoding: Bloats database, poor performance

**Future Enhancement:**
When cloud storage is set up, add file upload UI in variant forms. Backend API already accepts `images` array, so no API changes needed.

**Implementation:**
```typescript
// VariantForm: array of image objects
const [images, setImages] = useState<VariantImage[]>([
  { url: '', alt: '', is_primary: true }
])

// UI: text inputs for URL/alt, radio for primary
```

### 5. Set Product UI: Read-Only Computed Values

**Decision:** Display set cost and stock as read-only computed values fetched from backend endpoints:
- `GET /products/:id/set-cost` - Returns computed cost
- `GET /products/:id/set-stock` - Returns computed stock

**Rationale:**
- Computation logic lives in backend (single source of truth)
- Avoids frontend duplication of business rules
- Handles edge cases consistently (missing costs, out of stock)
- Simple display: just show the numbers

**Alternatives Considered:**
- ❌ Compute in frontend: Duplicates logic, can diverge from backend
- ❌ Embedded in product detail response: Backend is designed for separate endpoints

**Implementation:**
```typescript
// In ProductDetailModal for set products
const [setCost, setSetCost] = useState<number | null>(null)
const [setStock, setSetStock] = useState<number | null>(null)

useEffect(() => {
  if (product.type === 'set') {
    productService.getSetCost(product.id).then(setSetCost)
    productService.getSetStock(product.id).then(setSetStock)
  }
}, [product])
```

### 6. Cost History: Separate Modal View

**Decision:** Cost/price history displayed in a dedicated modal triggered by "Ver historial" button in variant/package detail views.

**Rationale:**
- History is infrequently accessed (not primary use case)
- Keeps main UI clean and focused
- Modal can show full history timeline with dates, amounts, superseded status
- Follows common UI pattern for secondary data

**Alternatives Considered:**
- ❌ Inline accordion: Clutters main view, pushes content down
- ❌ Separate page: Breaks flow, too much navigation

**Implementation:**
```typescript
// CostHistoryModal component
<CostHistoryModal
  isOpen={showHistory}
  onClose={() => setShowHistory(false)}
  history={costHistory}
  entityType="variant" // or "package"
/>
```

### 7. Authorization: Check Role in Components

**Decision:** Use `useAuth` hook to get user role and conditionally render edit/delete buttons. View-only for analysts.

**Rationale:**
- Consistent with existing auth patterns in rayito-admin
- Simple role check: `role === 'admin' || role === 'manager'`
- Backend enforces authorization (frontend is convenience only)
- No complex permission system needed (3 roles, simple rules)

**Alternatives Considered:**
- ❌ Route-level guards: Too restrictive (analysts need to view)
- ❌ Permission library (CASL, etc.): Over-engineering for 3 roles

**Implementation:**
```typescript
const { user } = useAuth()
const canEdit = user?.role === 'admin' || user?.role === 'manager'

{canEdit && (
  <Button onClick={handleEdit}>Editar</Button>
)}
```

### 8. Form Validation: Inline HTML5 + Manual Checks

**Decision:** Use HTML5 validation attributes (`required`, `min`, `pattern`) plus manual validation in submit handlers.

**Rationale:**
- No form library needed (react-hook-form, Formik = YAGNI)
- HTML5 validation works well for simple forms
- Manual checks for business rules (e.g., set must have components)
- Consistent with existing forms in rayito-admin

**Alternatives Considered:**
- ❌ Zod/Yup schemas: Over-engineering, adds dependency
- ❌ react-hook-form: Not needed for 5-10 field forms

### 9. Navigation: Add "Productos" Menu Item

**Decision:** Add "Productos" to sidebar navigation in `Navigation.tsx` with two sub-items:
- "Productos" → `/productos`
- "Empaques" → `/empaques`

**Rationale:**
- Products and packages are related but distinct (packages are reusable)
- Separate pages for clearer UX (different CRUD operations)
- Follows existing nav pattern (single-level menu)

**Alternatives Considered:**
- ❌ Tabs within single page: Less clear separation, shared state complexity
- ❌ Packages as sub-section of product detail: Doesn't fit (packages are independent)

## Risks / Trade-offs

**[Risk]** No image upload UI limits usability → **Mitigation:** Document URL-based workflow, add upload in v2 when cloud storage is set up.

**[Risk]** Fetching all packages for dropdown may be slow with 100+ packages → **Mitigation:** Current scope is small-scale (<50 packages expected), add autocomplete if needed later.

**[Risk]** Separate API calls for set cost/stock can cause inconsistency → **Mitigation:** Backend endpoints are idempotent, fetch together in single effect, show loading state.

**[Risk]** No validation of image URLs (broken links) → **Mitigation:** Display placeholder on error, user can see immediately and fix URL.

**[Risk]** Cost history modal can be slow with 100+ records → **Mitigation:** Backend should limit history to last 50 records (reasonable for small factory), add pagination in v2 if needed.

**[Risk]** No optimistic updates (spinner waits for API) → **Mitigation:** Acceptable for small-scale use, prioritize simplicity over perceived performance.

**[Trade-off]** URL-only images vs file upload: Simplicity and cost savings vs user experience.

**[Trade-off]** No pagination: Simpler code vs potential performance issues at scale (100+ products). Decision: Scale is unlikely, simplicity wins.

**[Trade-off]** Component state vs Zustand for form state: Less abstraction vs potential prop drilling. Decision: Forms are localized, no need for global state.
