# Implementation Tasks: Store Collections Management

## 1. Foundation Setup

- [x] 1.1 Create `src/features/collections/` directory structure (components, hooks, api, types, store subdirectories)
- [x] 1.2 Create TypeScript type definitions in `src/features/collections/types/collection.types.ts` (Collection, CollectionItem, CollectionState, CreateCollectionRequest, UpdateStateRequest, CollectionFilters)
- [x] 1.3 Create collections API client in `src/features/collections/api/collectionsApi.ts` with methods: list, create, get, updateItems, updateMetadata, finalize, updateState
- [x] 1.4 Create barrel export `src/features/collections/index.ts` for public API

## 2. State Management

- [x] 2.1 Create Zustand store in `src/features/collections/store/collectionsStore.ts` with state: collections array, isLoading, error
- [x] 2.2 Add store actions: setCollections, addCollection, updateCollection, removeCollection, setLoading, setError, reset
- [x] 2.3 Create custom hook `src/features/collections/hooks/useCollections.ts` for fetching collections with filters
- [x] 2.4 Create custom hook `src/features/collections/hooks/useCreateCollection.ts` for collection creation mutation
- [x] 2.5 Create custom hook `src/features/collections/hooks/useUpdateCollectionState.ts` for state transition mutation

## 3. Utility Components

- [x] 3.1 Create `CollectionStateBadge` component in `src/features/collections/components/CollectionStateBadge.tsx` with color mapping (draft→yellow, active→blue, paid→green, cancelled→red)
- [x] 3.2 Create utility function `getGoogleDriveUrl` in `src/features/collections/utils/googleDrive.ts` to construct Drive URLs from document_id
- [x] 3.3 Create currency formatting utility `formatColombiaCurrency` in `src/features/collections/utils/currency.ts`

## 4. Product Selection

- [x] 4.1 Create `ProductSelector` component in `src/features/collections/components/ProductSelector.tsx` using shadcn/ui Combobox
- [x] 4.2 Add product variant search with display of name, color, size, SKU
- [x] 4.3 Add current cost display in variant selector
- [x] 4.4 Filter out already selected variants from dropdown
- [x] 4.5 Handle variant selection callback with onSelect prop

## 5. Collection Creation Modal

- [x] 5.1 Create `CreateCollectionModal` component in `src/features/collections/components/CreateCollectionModal.tsx` using shadcn/ui Dialog
- [x] 5.2 Add local state for form: items (array), notes (string), paymentDueDate (Date | null)
- [x] 5.3 Add "Agregar producto" button that renders ProductSelector
- [x] 5.4 Add collection items list with quantity inputs and delete buttons
- [x] 5.5 Add quantity validation (integer, > 0) with error messages in Spanish
- [x] 5.6 Add optional notes textarea with 500 character limit validation
- [x] 5.7 Add optional payment due date picker with validation (future date, max 1 year)
- [x] 5.8 Add form validation function to check: at least 1 item, valid quantities, valid optional fields
- [x] 5.9 Add submit handler that calls useCreateCollection mutation with store_id, items, notes, payment_due_date
- [x] 5.10 Add loading state on submit button with spinner
- [x] 5.11 Add success handler: close modal, show toast "Cuenta de cobro creada exitosamente"
- [x] 5.12 Add error handler: display error message in modal
- [x] 5.13 Add cancel button to close modal without submission

## 6. Collections Table

- [x] 6.1 Create `CollectionsTable` component in `src/features/collections/components/CollectionsTable.tsx` using shadcn/ui Table
- [x] 6.2 Add state filter dropdown with options: "Todos", "Borrador", "Activo", "Pagado", "Cancelado"
- [x] 6.3 Add table columns: No. (collection_number), Fecha (created_at), Total (total_price), Estado (CollectionStateBadge), PDF (link), Actions (dropdown)
- [x] 6.4 Add sorting by collection_number (asc/desc toggle)
- [x] 6.5 Add sorting by created_at (default desc, toggle to asc)
- [x] 6.6 Add date formatting for created_at column (YYYY-MM-DD)
- [x] 6.7 Add Colombian currency formatting for total_price column
- [x] 6.8 Add PDF link icon that opens Google Drive URL in new tab (only for finalized collections)
- [x] 6.9 Add loading skeleton state while fetching
- [x] 6.10 Add empty state message "No hay cuentas de cobro. Crea la primera cuenta de cobro para este comercio."
- [x] 6.11 Add empty filter state message "No hay cuentas de cobro con este estado."
- [x] 6.12 Add error state with retry button
- [x] 6.13 Add "Crear cuenta de cobro" button in table header

## 7. Collection Actions Dropdown

- [x] 7.1 Create `CollectionActions` component in `src/features/collections/components/CollectionActions.tsx` using shadcn/ui DropdownMenu
- [x] 7.2 Add conditional actions based on state: draft (Editar, Finalizar, Cancelar), active (Ver detalles, Marcar como pagado, Cancelar), terminal (Ver detalles only)
- [x] 7.3 Add "Ver detalles" action that opens collection details modal (all states)
- [x] 7.4 Add "Editar" action that opens edit modal (draft only)
- [x] 7.5 Add "Finalizar" action with confirmation dialog (draft only)
- [x] 7.6 Add "Marcar como pagado" action with payment details dialog (active only)
- [x] 7.7 Add "Cancelar" action with cancel reason dialog (draft and active)

## 8. Finalize Collection Dialog

- [x] 8.1 Create `FinalizeCollectionDialog` component in `src/features/collections/components/FinalizeCollectionDialog.tsx`
- [x] 8.2 Add confirmation message "¿Finalizar esta cuenta de cobro? Se generará el PDF y no podrá editarse."
- [x] 8.3 Add confirm handler that calls collectionsApi.finalize(id)
- [x] 8.4 Add success handler: update store, show toast "Cuenta de cobro finalizada exitosamente", close dialog
- [x] 8.5 Add error handler: show toast "Error al finalizar: {error message}"

## 9. Mark as Paid Dialog

- [x] 9.1 Create `MarkAsPaidDialog` component in `src/features/collections/components/MarkAsPaidDialog.tsx`
- [x] 9.2 Add payment_method dropdown with options: "Transferencia", "Efectivo", "Tarjeta", "Otro"
- [x] 9.3 Add payment_reference text input (optional)
- [x] 9.4 Add form validation: payment_method is required
- [x] 9.5 Add submit handler that calls useUpdateCollectionState with state "paid", payment_method, payment_reference
- [x] 9.6 Add success handler: update store, show toast "Cuenta de cobro marcada como pagada", close dialog
- [x] 9.7 Add error handler: show toast with error message

## 10. Cancel Collection Dialog

- [x] 10.1 Create `CancelCollectionDialog` component in `src/features/collections/components/CancelCollectionDialog.tsx`
- [x] 10.2 Add cancel_reason textarea with validation: required, max 500 characters
- [x] 10.3 Add submit handler that calls useUpdateCollectionState with state "cancelled", cancel_reason
- [x] 10.4 Add success handler: update store, show toast "Cuenta de cobro cancelada", close dialog
- [x] 10.5 Add error handler: show toast with error message

## 11. Collection Details Modal

- [x] 11.1 Create `CollectionDetailsModal` component in `src/features/collections/components/CollectionDetailsModal.tsx`
- [x] 11.2 Display collection metadata: collection_number, created_at, state badge, payment_due_date, notes
- [x] 11.3 Display items table with columns: product_name, variant_color, size_name, variant_sku, quantity, unit_price_original, unit_price_final
- [x] 11.4 Display pricing breakdown: subtotal_before_discount, discount_percentage, discount_amount, subtotal_after_discount, vat_deducted, vat_percentage, vat_amount, total_price
- [x] 11.5 Conditionally display payment details for paid state: payment_received_at, payment_method, payment_reference
- [x] 11.6 Conditionally display cancellation details for cancelled state: cancelled_at, cancel_reason
- [x] 11.7 Add close button

## 12. Edit Collection Modal

- [x] 12.1 Create `EditCollectionModal` component in `src/features/collections/components/EditCollectionModal.tsx` (reuse CreateCollectionModal structure)
- [x] 12.2 Pre-fill form with current collection: items, notes, payment_due_date
- [x] 12.3 Add separate handlers for updating items (PUT /collections/:id/items) vs metadata (PATCH /collections/:id)
- [x] 12.4 Add success handler: update store with new pricing values, show toast, close modal
- [x] 12.5 Add error handler: display error message

## 13. Store Page Integration

- [x] 13.1 Modify `src/pages/stores/[id].tsx` to add "Cuentas de Cobro" section below store details
- [x] 13.2 Add CollectionsTable component with storeId prop
- [x] 13.3 Add CreateCollectionModal with storeId prop and open/close state
- [x] 13.4 Wire "Crear cuenta de cobro" button to open CreateCollectionModal
- [x] 13.5 Add useCollections hook to fetch collections on page load

## 14. Error Handling & Edge Cases

- [x] 14.1 Handle 404 errors when collection not found
- [x] 14.2 Handle 403 errors for unauthorized state transitions
- [x] 14.3 Handle network errors with retry mechanism
- [x] 14.4 Handle concurrent state updates (optimistic update conflicts)
- [x] 14.5 Add validation error display for all forms (Spanish messages)

## 15. Testing & Polish

- [x] 15.1 Test full creation flow: open modal → add products → set quantities → submit → verify in table
- [x] 15.2 Test finalization flow: draft → finalize → verify PDF link appears
- [x] 15.3 Test mark as paid flow: active → mark as paid → verify state badge updates
- [x] 15.4 Test cancel flow: draft/active → cancel → verify state badge updates
- [x] 15.5 Test state filter: verify each filter option shows correct collections
- [x] 15.6 Test sorting: verify number and date sorting works
- [x] 15.7 Test validation: verify all error messages display correctly in Spanish
- [x] 15.8 Test empty states: verify messages for no collections and no filtered results
- [x] 15.9 Test error states: verify error messages and retry buttons work
- [x] 15.10 Verify accessibility: keyboard navigation, ARIA labels, focus management
- [x] 15.11 Verify responsive design: test on mobile and tablet viewports
- [x] 15.12 Verify color theme tokens: ensure all colors use CSS variables from index.css
