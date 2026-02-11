# ecomjunction

**The junction where e-commerce meets simplicity.**

A modern, full-stack e-commerce platform built with Next.js 15, NeonDB (Serverless Postgres), and TypeScript.

## 🎯 Project Goals

1. **Multi-tenant SaaS Platform** - Enable businesses to create their own branded e-commerce stores
2. **Lightning Fast** - Leverage Edge computing and serverless architecture for global performance
3. **Developer Experience** - Clean, maintainable codebase with type safety and modern patterns
4. **Scalable by Design** - Built to handle growth from 1 to 100,000+ merchants

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** NeonDB (Serverless PostgreSQL)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **ORM:** Custom SQL with @neondatabase/serverless
- **Auth:** (Coming tomorrow)
- **Payments:** (Coming soon)

## 📁 Project Structure

```
ecomjunction/
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   ├── lib/              # Utility functions & DB connection
│   └── types/            # TypeScript types
├── db/                   # Database migrations & seeds
├── public/               # Static assets
└── docs/                 # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A NeonDB account (free tier available)

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local`
3. Add your NeonDB connection string
4. Run `npm install`
5. Run `npm run dev`

### Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed development data
npm run db:seed
```

## 📝 Daily Development Log

| Date | Task | Status |
|------|------|--------|
| 2026-02-11 | Project foundation setup | ✅ Complete |
| 2026-02-12 | Authentication system | 🚧 Planned |

---

Built with ❤️ by the ecomjunction team.
