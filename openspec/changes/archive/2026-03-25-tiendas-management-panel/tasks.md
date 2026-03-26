## 1. Type Definitions

- [x] 1.1 Create src/types/store.ts with Store interface matching backend domain model
- [x] 1.2 Add Address interface with all fields (id, line1, line2, city, state, postal_code, country, timestamps)
- [x] 1.3 Add CollectionDocConfig interface with all boolean flags and timestamps
- [x] 1.4 Add CreateStoreRequest type for form submission
- [x] 1.5 Add UpdateStoreRequest type for partial updates

## 2. API Service Layer

- [x] 2.1 Create src/services/stores.ts file
- [x] 2.2 Implement listStores() function that calls GET /api/v1/stores
- [x] 2.3 Implement getStore(id) function that calls GET /api/v1/stores/:id
- [x] 2.4 Implement createStore(data) function that calls POST /api/v1/stores
- [x] 2.5 Implement updateStore(id, data) function that calls PATCH /api/v1/stores/:id
- [x] 2.6 Add error handling with Spanish error messages for each function
- [x] 2.7 Map API error codes (409, 404, 403, 400, 500) to user-friendly Spanish messages

## 3. Store List Component

- [x] 3.1 Create src/components/StoresList.tsx component
- [x] 3.2 Implement table with columns: identity_number, name, contact_person_name, contact_phone_number, discount_percentage
- [x] 3.3 Add loading state with spinner
- [x] 3.4 Add empty state with message "No hay tiendas registradas"
- [x] 3.5 Add error state with retry button
- [x] 3.6 Make table rows clickable to view store details
- [x] 3.7 Add "Nueva Tienda" button that triggers create form
- [x] 3.8 Use shadcn/ui Card component for layout

## 4. Store Form Component

- [x] 4.1 Create src/components/StoresForm.tsx component accepting mode (create/edit) and initialData props
- [x] 4.2 Add Identity Information section with fields: identity_number, name, legal_name, identity_type dropdown
- [x] 4.3 Add Address section with fields: line1, line2, city, state, postal_code, country
- [x] 4.4 Add Contact Details section with fields: contact_person_name, contact_person_email, contact_phone_number
- [x] 4.5 Add Configuration section with discount_percentage, deduct_vat checkbox, and collection doc config checkboxes
- [x] 4.6 Implement controlled inputs with useState for all fields
- [x] 4.7 Add validation function for required fields (identity_number, name, legal_name, identity_type, line1, city, state, postal_code, country, contact_person_name, contact_person_email)
- [x] 4.8 Add email format validation for contact_person_email
- [x] 4.9 Add range validation for discount_percentage (0-100)
- [x] 4.10 Add country code validation (2-letter ISO format)
- [x] 4.11 Display inline error messages below each field in Spanish
- [x] 4.12 Add submit button with loading state (disabled + spinner when submitting)
- [x] 4.13 Add cancel button that calls onCancel prop
- [x] 4.14 Implement form submission calling createStore or updateStore based on mode
- [x] 4.15 Handle API errors and display error messages
- [x] 4.16 Use shadcn/ui Card component to group form sections
- [x] 4.17 Use shadcn/ui Input, Select, Checkbox components for form fields

## 5. Store Detail Component

- [x] 5.1 Create src/components/StoresDetail.tsx component accepting storeId prop
- [x] 5.2 Fetch store data using getStore on component mount
- [x] 5.3 Add loading state with spinner
- [x] 5.4 Display Identity Information section (read-only)
- [x] 5.5 Display Address section with formatted address
- [x] 5.6 Display Contact Details section (read-only)
- [x] 5.7 Display Configuration section showing discount_percentage, deduct_vat status, and collection doc config flags
- [x] 5.8 Add "Editar" button that switches to edit mode
- [x] 5.9 Add "Volver" button that returns to list view
- [x] 5.10 Handle 404 error with "Tienda no encontrada" message and back button
- [x] 5.11 Use shadcn/ui Card component for section layout

## 6. Main Stores Page

- [x] 6.1 Create src/pages/StoresPage.tsx component
- [x] 6.2 Add state management for current view (list/create/edit/detail)
- [x] 6.3 Add state management for selected store ID
- [x] 6.4 Implement conditional rendering based on current view
- [x] 6.5 Add fetchStores function and pass to StoresList component
- [x] 6.6 Handle create button click to show StoresForm in create mode
- [x] 6.7 Handle store row click to show StoresDetail
- [x] 6.8 Handle edit button click to show StoresForm in edit mode with pre-filled data
- [x] 6.9 Handle form cancel to return to appropriate previous view
- [x] 6.10 Handle successful create/update to refresh list and show success message
- [x] 6.11 Add page title "Tiendas" using h1 with brand color (automatic from global CSS)

## 7. Navigation and Routing

- [x] 7.1 Update src/components/Navigation.tsx to add "Tiendas" nav item with Store icon from lucide-react
- [x] 7.2 Add NavLink to /tiendas route with Spanish text "Tiendas"
- [x] 7.3 Update src/App.tsx to add /tiendas route wrapped in ProtectedRoute and Layout
- [x] 7.4 Import StoresPage component and use in route element

## 8. Testing and Validation

- [x] 8.1 Test listing stores displays correctly with mock data
- [x] 8.2 Test empty state displays when no stores exist
- [x] 8.3 Test loading states for list, detail, create, and update operations
- [x] 8.4 Test creating new store with all required fields
- [x] 8.5 Test validation errors for missing required fields
- [x] 8.6 Test validation errors for invalid email format
- [x] 8.7 Test validation errors for invalid discount percentage
- [x] 8.8 Test validation errors for invalid country code
- [x] 8.9 Test duplicate identity number error handling
- [x] 8.10 Test viewing store details shows all sections correctly
- [x] 8.11 Test editing existing store and updating fields
- [x] 8.12 Test cancel buttons return to correct views without saving
- [x] 8.13 Test 404 error handling for non-existent store
- [x] 8.14 Test authorization errors for analyst role (if applicable)
- [x] 8.15 Test navigation between list, create, detail, and edit views
- [x] 8.16 Test that all UI text is in Spanish
- [x] 8.17 Test that components follow existing design patterns and use brand colors
