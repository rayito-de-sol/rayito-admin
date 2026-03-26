## Why

The backend store management API is complete and ready for integration. Users need a way to manage third-party stores (tiendas) through the admin interface to track client information, addresses, contact details, and configuration preferences for collection documents. This enables factory managers and admins to maintain complete store records required for business operations.

## What Changes

- Add "Tiendas" navigation item in sidebar (Spanish UI text)
- Add `/tiendas` route with protected access (Spanish URL)
- Create StoresPage component with list view showing all stores in a table
- Create store creation form with all required fields (identity, address, contact, configuration)
- Create store detail view showing complete store information
- Create store edit form supporting partial updates
- Add API service integration for store CRUD operations (create, read, update, list)
- Add form validation for identity types (NIT, RUT, CC, CE, RFC), email format, and discount percentage (0-100)
- Add error handling for API errors (duplicate identity, validation failures, not found)
- Support all Store model fields: identity information, legal details, address, contact person, discount configuration, VAT settings, and collection document configuration

## Capabilities

### New Capabilities
- `stores-list`: Display all stores in a table with search and basic information
- `stores-create`: Create new store with complete form including identity, address, contact, and configuration sections
- `stores-detail`: View complete store information including all nested data (address, collection doc config)
- `stores-edit`: Update existing store information with partial updates support
- `stores-api-integration`: Service layer for API communication with store endpoints

### Modified Capabilities
<!-- No existing capabilities are being modified -->

## Impact

**New Files**:
- `src/pages/StoresPage.tsx` - Main stores management page
- `src/components/StoresList.tsx` - Store list table component
- `src/components/StoresForm.tsx` - Store create/edit form component
- `src/components/StoresDetail.tsx` - Store detail view component
- `src/services/stores.ts` - API service for store operations
- `src/types/store.ts` - TypeScript types for Store, Address, CollectionDocConfig

**Modified Files**:
- `src/components/Navigation.tsx` - Add "Tiendas" navigation link
- `src/App.tsx` - Add `/tiendas` route

**Dependencies**:
- Will use existing shadcn/ui components (Button, Input, Card, etc.)
- Follows existing patterns from rayito-admin (simple state, Axios for HTTP, Spanish UI)
- No new external dependencies required
