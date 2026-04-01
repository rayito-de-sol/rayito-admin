## ADDED Requirements

### Requirement: API client SHALL authenticate requests

The API client SHALL automatically inject JWT tokens from Supabase session into Authorization headers for all product catalog API requests.

#### Scenario: Authenticated request
- **WHEN** a product catalog API method is called
- **THEN** the request includes `Authorization: Bearer <token>` header with valid Supabase JWT token

#### Scenario: Expired token
- **WHEN** API returns 401 Unauthorized
- **THEN** the interceptor signs out the user and redirects to login page

### Requirement: API client SHALL handle errors consistently

The API client SHALL map backend error codes to Spanish error messages for all product catalog endpoints.

#### Scenario: Product not found
- **WHEN** API returns 404 with code `PRODUCT_NOT_FOUND`
- **THEN** error message is "Producto no encontrado"

#### Scenario: Package in use
- **WHEN** API returns 409 with code `PACKAGE_IN_USE`
- **THEN** error message is "No se puede eliminar el empaque porque está en uso por uno o más productos"

#### Scenario: Validation error
- **WHEN** API returns 400 with code `VALIDATION_FAILED` and a message
- **THEN** error message is the backend validation message

#### Scenario: Network error
- **WHEN** API request fails with no response
- **THEN** error message is "Error de conexión. Verifique su red e intente nuevamente"

### Requirement: Product service SHALL support all product operations

The product service SHALL provide methods for creating, reading, updating products, managing pricing, and computing set product metrics.

#### Scenario: List products with filters
- **WHEN** listProducts is called with status filter "active"
- **THEN** GET /api/v1/products?status=active is requested

#### Scenario: Create product with package
- **WHEN** createProduct is called with package_id
- **THEN** POST /api/v1/products is requested with package_id in body

#### Scenario: Update product price
- **WHEN** updatePrice is called with product ID and price amount
- **THEN** PATCH /api/v1/products/:id/price is requested with amount in body

#### Scenario: Get set product cost
- **WHEN** getSetCost is called with set product ID
- **THEN** GET /api/v1/products/:id/set-cost is requested

#### Scenario: Get set product stock
- **WHEN** getSetStock is called with set product ID
- **THEN** GET /api/v1/products/:id/set-stock is requested

### Requirement: Variant service SHALL support variant operations

The variant service SHALL provide methods for creating, reading variants, updating stock and cost, and retrieving cost history.

#### Scenario: Create variant
- **WHEN** createVariant is called with product ID and variant data
- **THEN** POST /api/v1/products/:id/variants is requested

#### Scenario: Update variant stock
- **WHEN** updateStock is called with variant ID and stock amount
- **THEN** PATCH /api/v1/variants/:id/stock is requested

#### Scenario: Update variant cost
- **WHEN** updateCost is called with variant ID and cost amount
- **THEN** PATCH /api/v1/variants/:id/cost is requested

#### Scenario: Get variant cost history
- **WHEN** getCostHistory is called with variant ID
- **THEN** GET /api/v1/variants/:id/cost-history is requested

### Requirement: Size service SHALL support size operations

The size service SHALL provide methods for creating product-specific sizes.

#### Scenario: Create size for product
- **WHEN** createSize is called with product ID and size data
- **THEN** POST /api/v1/products/:id/sizes is requested

### Requirement: Package service SHALL support package operations

The package service SHALL provide methods for creating, reading, updating packages, managing costs, and retrieving cost history.

#### Scenario: List all packages
- **WHEN** listPackages is called
- **THEN** GET /api/v1/packages is requested

#### Scenario: Create package
- **WHEN** createPackage is called with package data and initial cost
- **THEN** POST /api/v1/packages is requested

#### Scenario: Update package cost
- **WHEN** updateCost is called with package ID and cost amount
- **THEN** PATCH /api/v1/packages/:id/cost is requested

#### Scenario: Get package cost history
- **WHEN** getCostHistory is called with package ID
- **THEN** GET /api/v1/packages/:id/cost-history is requested
