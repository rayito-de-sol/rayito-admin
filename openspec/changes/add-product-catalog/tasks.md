## 1. Setup & Type Definitions

- [x] 1.1 Create TypeScript type definitions in `src/types/product.ts` for Product, CreateProductRequest, UpdateProductRequest
- [x] 1.2 Create TypeScript type definitions in `src/types/variant.ts` for Variant, CreateVariantRequest, VariantImage, VariantCost
- [x] 1.3 Create TypeScript type definitions in `src/types/size.ts` for Size, CreateSizeRequest
- [x] 1.4 Create TypeScript type definitions in `src/types/package.ts` for Package, CreatePackageRequest, UpdatePackageRequest, PackageCost
- [x] 1.5 Add ProductCategory enum and ProductType enum to product types
- [x] 1.6 Add types for SetCostResponse and SetStockResponse

## 2. Service Layer - API Clients

- [x] 2.1 Create `src/services/productService.ts` with listProducts, getProduct, createProduct, updateProduct, updateStatus, updatePrice, getPriceHistory methods
- [x] 2.2 Add getSetCost and getSetStock methods to productService
- [x] 2.3 Create `src/services/variantService.ts` with createVariant, getVariant, updateStock, updateCost, getCostHistory methods
- [x] 2.4 Create `src/services/sizeService.ts` with createSize method
- [x] 2.5 Create `src/services/packageService.ts` with listPackages, getPackage, createPackage, updatePackage, updateCost, getCostHistory methods
- [x] 2.6 Add error message mapping for all product catalog error codes (PRODUCT_NOT_FOUND, PACKAGE_IN_USE, DUPLICATE_SLUG, etc.)

## 3. Shared Components

- [x] 3.1 Create `src/components/CostHistoryModal.tsx` component for displaying cost history (reusable for variants and packages)
- [x] 3.2 Create `src/components/PriceHistoryModal.tsx` component for displaying product price history
- [x] 3.3 Create `src/components/ImageGalleryModal.tsx` component for viewing variant images in full screen
- [x] 3.4 Create status badge component or utility for product status (draft/active/inactive)
- [x] 3.5 Create currency formatter utility function for COP amounts

## 4. Products - List Page

- [x] 4.1 Create `src/pages/ProductsPage.tsx` with basic layout and page structure
- [x] 4.2 Add product list fetching logic with loading and error states
- [x] 4.3 Create `src/components/ProductCard.tsx` to display product summary (name, category, type, status, price)
- [x] 4.4 Add filter controls for status (all/draft/active/inactive)
- [x] 4.5 Add filter controls for category (all/set/turbante/cintillo/pinza/maximono/mono/diadema/otro)
- [x] 4.6 Add filter controls for type (all/single/set)
- [x] 4.7 Implement filter logic to call API with query parameters
- [x] 4.8 Add "Crear Producto" button with role-based visibility (admin/manager only)
- [x] 4.9 Add empty state message "No hay productos registrados"
- [x] 4.10 Add click handler on ProductCard to open product detail modal

## 5. Products - Create & Edit

- [x] 5.1 Create `src/components/ProductCreateModal.tsx` with form for creating products
- [x] 5.2 Add form fields: name, slug, description, SKU prefix, category dropdown, type dropdown, initial price
- [x] 5.3 Add package selection dropdown in create form (load from packageService.listPackages)
- [x] 5.4 Add "Sin empaque" option to package dropdown (maps to package_id: null)
- [x] 5.5 Implement form validation (required fields, non-negative price, slug format)
- [x] 5.6 Implement form submit handler with success message and list refresh
- [x] 5.7 Add error handling for duplicate slug and other creation errors
- [x] 5.8 Create `src/components/ProductEditModal.tsx` with form for editing products
- [x] 5.9 Pre-fill edit form with current product values
- [x] 5.10 Disable product type field in edit form (cannot change after creation)
- [x] 5.11 Implement edit form submit handler with success message and detail refresh

## 6. Products - Detail View

- [x] 6.1 Create `src/components/ProductDetailModal.tsx` with full product information display
- [x] 6.2 Display basic product info: name, slug, description, SKU prefix, category, tags, type, status
- [x] 6.3 Display current price and "Actualizar Precio" button (admin/manager only)
- [x] 6.4 Display associated package name and cost, or "Sin empaque" if no package
- [x] 6.5 Add "Editar" button with role-based visibility (admin/manager only)
- [x] 6.6 Add "Ver historial de precios" button to open PriceHistoryModal
- [x] 6.7 Add variants section with list of VariantCards
- [x] 6.8 Add "Agregar Variante" button with role-based visibility (admin/manager only)
- [x] 6.9 Add sizes section displaying all size labels
- [x] 6.10 Add "Agregar Talla" button with role-based visibility (admin/manager only)
- [x] 6.11 Add empty state messages for no variants and no sizes

## 7. Products - Pricing

- [x] 7.1 Create `src/components/ProductPriceUpdateForm.tsx` for updating product price
- [x] 7.2 Display current price in the form for reference
- [x] 7.3 Add validation for non-negative price amount
- [x] 7.4 Implement submit handler calling productService.updatePrice
- [x] 7.5 Show success message and refresh product detail on successful update
- [x] 7.6 Implement PriceHistoryModal to display all price records with dates and superseded status
- [x] 7.7 Format price amounts as "$X,XXX COP" in history view
- [x] 7.8 Show "Activo" badge for current price and "Reemplazado" for superseded

## 8. Variants - Management

- [x] 8.1 Create `src/components/VariantCard.tsx` to display variant summary (color, size, SKU, stock, cost, primary image)
- [x] 8.2 Add placeholder image for variants without images
- [x] 8.3 Add click handler on image to open ImageGalleryModal
- [x] 8.4 Add "Actualizar Stock" button with role-based visibility (admin/manager only)
- [x] 8.5 Add "Actualizar Costo" button with role-based visibility (admin/manager only)
- [x] 8.6 Add "Ver historial de costos" button
- [x] 8.7 Create `src/components/AddVariantForm.tsx` for creating variants
- [x] 8.8 Add form fields: color, size dropdown (load from product sizes), SKU, stock, cost
- [x] 8.9 Add image management UI: array of URL/alt text inputs with primary radio button
- [x] 8.10 Ensure first image is marked as primary by default
- [x] 8.11 Implement logic to ensure only one image is primary at a time
- [x] 8.12 Add validation for required fields and non-negative stock/cost
- [x] 8.13 Show "Primero debe crear una talla para este producto" message if no sizes exist
- [x] 8.14 Implement submit handler calling variantService.createVariant
- [x] 8.15 Show success message and refresh product detail on successful creation

## 9. Variants - Stock & Cost Updates

- [x] 9.1 Create `src/components/VariantStockUpdateForm.tsx` for updating stock
- [x] 9.2 Add validation for non-negative stock amount
- [x] 9.3 Implement submit handler calling variantService.updateStock
- [x] 9.4 Create `src/components/VariantCostUpdateForm.tsx` for updating cost
- [x] 9.5 Display current cost in the form for reference
- [x] 9.6 Add validation for non-negative cost amount
- [x] 9.7 Implement submit handler calling variantService.updateCost
- [x] 9.8 Implement CostHistoryModal for variants (reuse shared component from task 3.1)
- [x] 9.9 Fetch and display variant cost history with dates and superseded status
- [x] 9.10 Show "Activo" badge for current cost and "Reemplazado" for superseded

## 10. Sizes - Management

- [x] 10.1 Create `src/components/AddSizeForm.tsx` for creating sizes
- [x] 10.2 Add form field: label (text input)
- [x] 10.3 Add validation for required label field
- [x] 10.4 Implement submit handler calling sizeService.createSize
- [x] 10.5 Handle duplicate label error with message "Ya existe una talla con esta etiqueta para este producto"
- [x] 10.6 Show success message and refresh product detail on successful creation

## 11. Packages - List Page

- [x] 11.1 Create `src/pages/PackagesPage.tsx` with basic layout and page structure
- [x] 11.2 Add package list fetching logic with loading and error states
- [x] 11.3 Create `src/components/PackageCard.tsx` to display package summary (name, description, cost, usage count)
- [x] 11.4 Display "Usado en X productos" or "No está en uso" based on usage count
- [x] 11.5 Add "Crear Empaque" button with role-based visibility (admin/manager only)
- [x] 11.6 Add empty state message "No hay empaques registrados"
- [x] 11.7 Add "Editar" button on each card with role-based visibility (admin/manager only)
- [ ] 11.8 Add clickable usage count to view products using the package

## 12. Packages - Create & Edit

- [x] 12.1 Create `src/components/PackageCreateForm.tsx` with form for creating packages
- [x] 12.2 Add form fields: name, description (optional), initial cost
- [x] 12.3 Add validation for required fields and non-negative cost
- [x] 12.4 Implement submit handler calling packageService.createPackage
- [x] 12.5 Handle duplicate name error with message "Ya existe un empaque con este nombre"
- [x] 12.6 Show success message and refresh list on successful creation
- [x] 12.7 Create `src/components/PackageEditModal.tsx` with form for editing packages
- [x] 12.8 Pre-fill edit form with current package values
- [x] 12.9 Add "Actualizar Costo" button in edit modal (admin/manager only)
- [x] 12.10 Add "Ver historial de costos" button
- [x] 12.11 Implement edit form submit handler with success message and list refresh
- [x] 12.12 Handle PACKAGE_IN_USE error when trying to delete with message "No se puede eliminar el empaque porque está en uso por uno o más productos"

## 13. Packages - Cost Updates

- [x] 13.1 Create `src/components/PackageCostUpdateForm.tsx` for updating package cost
- [x] 13.2 Display current cost in the form for reference
- [x] 13.3 Add validation for non-negative cost amount
- [x] 13.4 Implement submit handler calling packageService.updateCost
- [x] 13.5 Show success message and refresh package list on successful update
- [x] 13.6 Implement CostHistoryModal for packages (reuse shared component from task 3.1)
- [x] 13.7 Fetch and display package cost history with dates and superseded status

## 14. Set Products - Composition

- [x] 14.1 Add set composition section to ProductDetailModal (conditional on product.type === 'set')
- [x] 14.2 Create `src/components/SetCompositionForm.tsx` for managing set components
- [x] 14.3 Display list of component variants with quantity, unit cost, and line total (qty × cost)
- [x] 14.4 Add "Agregar Componente" button with role-based visibility (admin/manager only)
- [x] 14.5 Implement component selection form (variant dropdown + quantity input)
- [x] 14.6 Add validation to prevent duplicate variants in composition
- [x] 14.7 Add remove button on each component with confirmation dialog
- [x] 14.8 Implement validation to prevent removing last component (set must have at least one)
- [x] 14.9 Fetch and display computed set cost from productService.getSetCost
- [x] 14.10 Fetch and display computed set stock from productService.getSetStock
- [x] 14.11 Display cost breakdown: "Componentes: $XX,XXX" + "Empaque: $X,XXX" = "Total: $XX,XXX"
- [x] 14.12 Automatically recalculate and refresh set cost/stock when components are added/removed

## 15. Navigation & Routing

- [x] 15.1 Add "Productos" navigation item to `src/components/Navigation.tsx` with icon
- [x] 15.2 Add "Empaques" sub-item under Productos section
- [x] 15.3 Add route for `/productos` in `src/App.tsx` with ProtectedRoute wrapper
- [x] 15.4 Add route for `/empaques` in `src/App.tsx` with ProtectedRoute wrapper
- [ ] 15.5 Test navigation between products and packages pages

## 16. Authorization & Permissions

- [ ] 16.1 Verify all "Editar" buttons check `user.role === 'admin' || user.role === 'manager'`
- [ ] 16.2 Verify all "Crear" buttons check admin/manager role
- [ ] 16.3 Verify all "Actualizar" buttons check admin/manager role
- [ ] 16.4 Verify analyst users can view all pages but cannot see edit/create buttons
- [ ] 16.5 Test authorization with different user roles (admin, manager, analyst)

## 17. Error Handling & Loading States

- [ ] 17.1 Add loading spinners to all data fetching operations
- [ ] 17.2 Add error messages for all failed API calls
- [ ] 17.3 Test network error handling (disconnect during operation)
- [ ] 17.4 Test 404 errors (product/package not found)
- [ ] 17.5 Test validation errors (duplicate slug, negative values, etc.)
- [ ] 17.6 Add loading state to all form submit buttons ("Creando...", "Actualizando...")

## 18. UI Polish & Spanish Translations

- [ ] 18.1 Verify all UI text is in Spanish
- [ ] 18.2 Verify all error messages are in Spanish
- [ ] 18.3 Verify date formatting uses Spanish locale (DD/MM/YYYY)
- [ ] 18.4 Verify currency formatting displays as "$X,XXX COP"
- [ ] 18.5 Add success toast messages for all create/update operations
- [ ] 18.6 Verify all modals have proper close buttons and ESC key support
- [ ] 18.7 Verify all forms have proper loading states and disabled submit during submission
- [ ] 18.8 Test mobile responsiveness of all pages and modals

## 19. Integration Testing

- [ ] 19.1 Test complete product creation flow (create product → add size → add variant → view detail)
- [ ] 19.2 Test variant image management (add multiple images, set primary, view gallery)
- [ ] 19.3 Test package association (create package → create product with package → view package usage)
- [ ] 19.4 Test set product composition (create set → add components → view computed cost/stock)
- [ ] 19.5 Test price history (create product → update price multiple times → view history)
- [ ] 19.6 Test cost history (create variant → update cost multiple times → view history)
- [ ] 19.7 Test package cost history (create package → update cost multiple times → view history)
- [ ] 19.8 Test filtering (filter by status, category, type)
- [ ] 19.9 Test stock updates on variants
- [ ] 19.10 Test that removing a component from set updates computed cost/stock

## 20. Documentation & Cleanup

- [ ] 20.1 Add JSDoc comments to all service methods
- [ ] 20.2 Add JSDoc comments to all component props interfaces
- [ ] 20.3 Review and remove any console.log statements
- [ ] 20.4 Verify no TypeScript errors or warnings
- [ ] 20.5 Run code formatter on all new files
- [ ] 20.6 Update main README if needed with product catalog features
