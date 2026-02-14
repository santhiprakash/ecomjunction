# ecomjunction API Documentation

**Base URL:** `http://localhost:3000/api`

---

## Authentication

The API supports two authentication methods:

### 1. Clerk Authentication (Web UI)
Uses Clerk sessions for Next.js app authentication.

### 2. JWT Authentication (API/Mobile)
Use Bearer tokens in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### POST /auth/register
Register a new user with email/password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": { "id": "...", "email": "...", "name": "...", "role": "customer" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /auth/login
Login with email/password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { "id": "...", "email": "...", "name": "...", "role": "customer" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### GET /auth/me
Get current authenticated user.

**Headers:** `Authorization: Bearer <token>` (or Clerk session)

**Response:**
```json
{
  "user": { "id": "...", "email": "...", "name": "...", "role": "..." }
}
```

### PUT /auth/me
Update current user profile.

**Headers:** `Authorization: Bearer <token>` (or Clerk session)

**Request:**
```json
{
  "name": "Updated Name",
  "avatar": "https://example.com/avatar.jpg"
}
```

---

## Store Endpoints

### GET /stores
List all stores with pagination.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `ownerId` (string, optional)

**Response:**
```json
{
  "stores": [...],
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

### POST /stores
Create a new store (authenticated).

**Request:**
```json
{
  "name": "My Store",
  "slug": "my-store",
  "description": "Store description",
  "logo": "https://example.com/logo.jpg"
}
```

### GET /stores/:id
Get store by ID or slug with products.

### PUT /stores/:id
Update store (owner only).

### DELETE /stores/:id
Delete store (owner only).

---

## Product Endpoints

### GET /products
List products with pagination and filtering.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `storeId` (string, optional)
- `status` (string, default: 'active')

### POST /products
Create a new product (store owner only).

**Request:**
```json
{
  "storeId": "uuid",
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "compareAtPrice": 129.99,
  "images": ["https://example.com/image.jpg"],
  "inventory": 100,
  "sku": "PROD-001",
  "status": "active"
}
```

### GET /products/:id
Get product by ID.

### PUT /products/:id
Update product (owner only).

### DELETE /products/:id
Delete product (owner only).

---

## Utility Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-02-14T..."
}
```

### POST /webhooks/clerk
Clerk webhook handler for user sync.

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "details": [...] // Optional validation errors
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
