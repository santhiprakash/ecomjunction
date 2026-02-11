# Database scripts for ecomjunction

## Setup

1. Create a NeonDB project at https://neon.tech
2. Copy the connection string
3. Add to `.env.local`: `DATABASE_URL="your-connection-string"`

## Migrations

```bash
# Run all migrations
npm run db:migrate

# Run specific migration
psql $DATABASE_URL -f db/migrations/001_initial_schema.sql
```

## Seeding

```bash
# Seed development data
npm run db:seed
```

## Useful Queries

```sql
-- List all stores
SELECT * FROM stores;

-- List all products with store info
SELECT p.*, s.name as store_name 
FROM products p 
JOIN stores s ON p.store_id = s.id;
```
