# ecomjunction

**The junction where e-commerce meets simplicity.**

A modern, full-stack e-commerce platform built with Next.js 16, NeonDB (Serverless Postgres), and TypeScript.

## 🎯 Project Goals

1. **Multi-tenant SaaS Platform** - Enable businesses to create their own branded e-commerce stores
2. **Lightning Fast** - Leverage Edge computing and serverless architecture for global performance
3. **Developer Experience** - Clean, maintainable codebase with type safety and modern patterns
4. **Scalable by Design** - Built to handle growth from 1 to 100,000+ merchants

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** NeonDB (Serverless PostgreSQL)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **ORM:** Custom SQL with @neondatabase/serverless
- **Auth:** Clerk (JWT-based authentication)
- **Validation:** Zod
- **Payments:** (Coming soon)

## 📁 Project Structure

```
ecomjunction/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── api/          # API routes
│   │   │   ├── health/   # Health check endpoint
│   │   │   ├── stores/   # Store CRUD endpoints
│   │   │   ├── products/ # Product CRUD endpoints
│   │   │   ├── users/    # User management endpoints
│   │   │   └── webhooks/ # Webhook handlers
│   │   ├── layout.tsx    # Root layout with Clerk
│   │   └── page.tsx      # Home page
│   ├── lib/              # Utility functions
│   │   ├── db.ts         # Database connection
│   │   └── auth.ts       # Auth helpers
│   ├── types/            # TypeScript types
│   └── middleware.ts     # Clerk auth middleware
├── db/                   # Database migrations & seeds
├── public/               # Static assets
└── docs/                 # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A NeonDB account (free tier available)
- A Clerk account for authentication

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local`
3. Add your NeonDB connection string
4. Add your Clerk credentials (get from https://clerk.com)
5. Run `npm install`
6. Run `npm run dev`

### Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed development data
npm run db:seed
```

## 📡 API Endpoints

### Health
- `GET /api/health` - Health check

### Stores
- `GET /api/stores` - List stores (supports pagination, owner filter)
- `POST /api/stores` - Create store (auth required)
- `GET /api/stores/:id` - Get store with products
- `PUT /api/stores/:id` - Update store (owner only)
- `DELETE /api/stores/:id` - Delete store (owner only)

### Products
- `GET /api/products?storeId=&page=&limit=` - List products (pagination, filters)
- `POST /api/products` - Create product (auth required, must own store)
- `GET /api/products/:id` - Get product
- `PUT /api/products/:id` - Update product (owner only)
- `DELETE /api/products/:id` - Delete product (owner only)

### Users
- `GET /api/users/me` - Get current user with stores
- `PUT /api/users/me` - Update current user

### Webhooks
- `POST /api/webhooks/clerk` - Clerk webhook handler

## 📝 Daily Development Log

| Date | Task | Status |
|------|------|--------|
| 2026-02-11 | Project foundation setup | ✅ Complete |
| 2026-02-13 | Authentication system (Clerk) | ✅ Complete |
| 2026-02-13 | Products API | ✅ Complete |
| 2026-02-13 | Users API | ✅ Complete |
| 2026-02-13 | Store API with auth | ✅ Complete |
| 2026-02-13 | Webhook handlers | ✅ Complete |
| 2026-02-14 | Image upload (R2) | 🚧 Planned |
| 2026-02-14 | Orders API | 🚧 Planned |

---

Built with ❤️ by the ecomjunction team.
