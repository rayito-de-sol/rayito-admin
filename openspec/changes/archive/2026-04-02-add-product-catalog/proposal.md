## Why

Rayito Admin needs a comprehensive product catalog management system to manage the factory's inventory of Colombian hair accessories (monos, lazos, diademas, turbantes, etc.). Currently, there is no UI for managing products, variants, sizes, or packages, making it impossible for factory managers to catalog items, track costs, or manage stock levels.

## What Changes

- Add complete CRUD interface for products with support for single and set product types
- Add filtering by status (draft/active/inactive), category, and type in product list view
- Add variant management UI with color, size, SKU, stock tracking, and image galleries
- Add size management UI for product-specific sizes
- Add packages management section for reusable packaging entities with cost tracking
- Add set product composition UI showing computed costs and stock from component variants
- Add cost and price history views for variants and packages
- Add image upload and management for product variants (multiple images with primary selection)
- Add API integration layer for all product catalog endpoints
- Add navigation menu item for "Productos" with sub-sections (Products, Packages)
- Add authorization controls for role-based access (admin/manager can edit, analyst can view)
- Add form validation for required fields and business rules

## Capabilities

### New Capabilities

- `products-list`: Product listing page with filters for status, category, and type
- `products-detail`: Product detail view displaying variants, sizes, pricing, and package information
- `products-create`: Create new product form supporting both single and set types with initial pricing
- `products-edit`: Edit product information including name, description, category, tags, and status
- `products-pricing`: Update product pricing with price history tracking
- `variants-management`: CRUD operations for product variants including stock, cost, and image management
- `variants-cost-history`: View variant cost history showing active and superseded records
- `sizes-management`: Create and manage product-specific sizes with unique constraints
- `packages-list`: List all reusable packages with usage information
- `packages-create`: Create new package with name, description, and initial cost
- `packages-edit`: Edit package information and update costs with history tracking
- `packages-cost-history`: View package cost history showing active and superseded records
- `set-products-composition`: Manage set product components with computed cost and stock calculations
- `product-catalog-api`: API client service for all product catalog endpoints with authentication

### Modified Capabilities

<!-- No existing capabilities are being modified -->

## Impact

**New Files:**
- `src/pages/ProductsPage.tsx` - Products list view
- `src/pages/ProductDetailPage.tsx` - Product detail view
- `src/pages/ProductCreatePage.tsx` - Create product form
- `src/pages/ProductEditPage.tsx` - Edit product form
- `src/pages/PackagesPage.tsx` - Packages list and management
- `src/components/VariantForm.tsx` - Variant creation/edit form
- `src/components/VariantCard.tsx` - Variant display component
- `src/components/SizeForm.tsx` - Size creation form
- `src/components/SetCompositionForm.tsx` - Set product composition UI
- `src/components/CostHistoryView.tsx` - Cost history display
- `src/components/PriceHistoryView.tsx` - Price history display
- `src/services/productService.ts` - Product API client
- `src/services/variantService.ts` - Variant API client
- `src/services/sizeService.ts` - Size API client
- `src/services/packageService.ts` - Package API client
- `src/types/product.ts` - Product type definitions
- `src/types/variant.ts` - Variant type definitions
- `src/types/package.ts` - Package type definitions

**Modified Files:**
- `src/App.tsx` - Add routes for product catalog pages
- `src/components/Navigation.tsx` - Add "Productos" menu item with sub-sections

**Dependencies:**
- Existing: axios (HTTP client), @supabase/supabase-js (auth tokens), shadcn/ui (forms, tables)
- No new dependencies required

**API Endpoints:**
- All endpoints under `/api/v1/products`, `/api/v1/variants`, `/api/v1/sizes`, `/api/v1/packages`
- Requires Authorization header with JWT token from Supabase Auth
