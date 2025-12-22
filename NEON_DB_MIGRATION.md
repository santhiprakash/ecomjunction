# Neon DB Migration Guide

**Project:** eComJunction
**Migration Type:** localStorage → Neon PostgreSQL
**Date:** December 22, 2025
**Status:** Preparation Phase

---

## Table of Contents

1. [Overview](#overview)
2. [Migration Strategy](#migration-strategy)
3. [Neon Database Schema](#neon-database-schema)
4. [Data Mapping](#data-mapping)
5. [Migration Scripts](#migration-scripts)
6. [Backend API Design](#backend-api-design)
7. [Frontend Changes](#frontend-changes)
8. [Testing Strategy](#testing-strategy)
9. [Rollout Plan](#rollout-plan)
10. [Rollback Plan](#rollback-plan)

---

## Overview

### Current State

eComJunction currently uses **localStorage** for all data persistence:

- ✅ **Pros**:
  - No backend required
  - Instant writes/reads
  - Simple implementation
  - Works offline

- ❌ **Cons**:
  - Limited storage (~5-10MB)
  - No cross-device sync
  - No concurrent users
  - Data easily lost
  - No real-time features
  - No advanced querying

### Target State

Migrating to **Neon PostgreSQL** provides:

- ✅ **Serverless Postgres**: Auto-scaling, no infrastructure management
- ✅ **Unlimited Storage**: No 10MB localStorage limits
- ✅ **Multi-device Sync**: Access from anywhere
- ✅ **Real-time Collaboration**: Multiple users, teams
- ✅ **Advanced Querying**: Complex filters, aggregations
- ✅ **Data Security**: Proper backup, encryption at rest
- ✅ **Analytics**: Real tracking, insights, reporting

### Migration Scope

#### Data to Migrate
1. **Users**: Mock users → Real user accounts
2. **Products**: localStorage products → Database products with user_id
3. **Theme Settings**: JSON object → users.theme_settings (JSONB)
4. **Affiliate IDs**: Not stored → affiliate_ids table
5. **Categories**: Dynamic extraction → categories table
6. **Analytics**: Not tracked → analytics table (new data)

#### Components to Update
1. **Contexts**: AuthContext, ProductContext, ThemeContext
2. **Services**: Create new API service layer
3. **Storage**: Remove localStorage dependencies
4. **Authentication**: Real JWT-based auth
5. **API Integration**: REST endpoints for all operations

---

## Migration Strategy

### Three-Phase Approach

#### Phase 1: Setup & Infrastructure (Week 1)
**Goal**: Establish Neon database and backend API

1. **Neon Database Setup**
   - Create Neon project
   - Run schema migrations
   - Configure connection pooling
   - Set up development/production environments

2. **Backend API Development**
   - Initialize Node.js/Express project
   - Set up TypeScript
   - Configure database connection (@neondatabase/serverless)
   - Implement JWT authentication
   - Create REST endpoints

3. **Testing Infrastructure**
   - Set up test database
   - Create seed data
   - Write API tests

#### Phase 2: Data Migration & API Integration (Week 2)
**Goal**: Migrate existing data and connect frontend

1. **Data Migration**
   - Export localStorage data
   - Transform data format
   - Bulk import to Neon
   - Verify data integrity

2. **Frontend Integration**
   - Create API service layer
   - Update contexts to use API
   - Handle loading states
   - Implement error handling
   - Add optimistic updates

3. **Authentication Migration**
   - Implement real registration
   - JWT token management
   - Session handling
   - Password hashing (bcrypt)

#### Phase 3: Testing & Deployment (Week 3)
**Goal**: Ensure stability and deploy

1. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests
   - Performance testing
   - Security testing

2. **Deployment**
   - Deploy backend (Vercel/Railway/Fly.io)
   - Update frontend endpoints
   - Monitor errors
   - Performance monitoring

3. **Migration Support**
   - User data migration tool
   - Support documentation
   - Rollback procedures

---

## Neon Database Schema

### Schema Overview

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Core tables
- users              # User accounts and profiles
- products           # Product catalog
- categories         # User-defined categories
- affiliate_ids      # Platform affiliate IDs
- analytics          # Click and conversion tracking
- sessions           # User sessions (optional)
```

### Complete Schema

```sql
-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    website_url VARCHAR(500),

    -- Social Links (JSONB)
    social_links JSONB DEFAULT '{
        "twitter": null,
        "instagram": null,
        "youtube": null,
        "facebook": null,
        "linkedin": null,
        "tiktok": null
    }',

    -- Theme Settings (JSONB)
    theme_settings JSONB DEFAULT '{
        "primaryColor": "#6366F1",
        "secondaryColor": "#EC4899",
        "accentColor": "#059669",
        "textColor": "#1F2937",
        "backgroundColor": "#FFFFFF"
    }',

    -- Subscription & Status
    subscription_plan VARCHAR(20) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
    subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trialing')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,

    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    email_verification_expires_at TIMESTAMP WITH TIME ZONE,

    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP WITH TIME ZONE,

    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_subscription_plan ON users(subscription_plan);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================
-- AFFILIATE IDS TABLE
-- ============================================
CREATE TABLE affiliate_ids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'amazon', 'flipkart', 'myntra', 'nykaa', 'other'
    affiliate_id VARCHAR(255) NOT NULL,
    platform_name VARCHAR(100), -- Custom name for the platform
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- Indexes for affiliate_ids
CREATE INDEX idx_affiliate_ids_user_id ON affiliate_ids(user_id);
CREATE INDEX idx_affiliate_ids_platform ON affiliate_ids(platform);
CREATE INDEX idx_affiliate_ids_is_active ON affiliate_ids(is_active);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
    icon VARCHAR(50), -- Icon name from Lucide
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name),
    UNIQUE(user_id, slug)
);

-- Indexes for categories
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Product Information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD' CHECK (currency IN ('USD', 'INR', 'EUR', 'GBP')),

    -- URLs
    affiliate_url TEXT NOT NULL, -- Final URL with affiliate ID
    original_url TEXT, -- Original product URL before modification
    image_url TEXT,

    -- Classification
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    source VARCHAR(50), -- 'amazon', 'flipkart', 'myntra', 'nykaa', 'other'

    -- Ratings & Reviews
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,

    -- Affiliate Tracking
    platform VARCHAR(50), -- Detected platform
    affiliate_id_used UUID REFERENCES affiliate_ids(id) ON DELETE SET NULL,
    commission_rate DECIMAL(5,2), -- Percentage commission

    -- AI Extraction Metadata
    extraction_method VARCHAR(50), -- 'manual', 'ai', 'url_parse'
    extraction_confidence DECIMAL(3,0), -- 0-100 confidence score
    extracted_at TIMESTAMP WITH TIME ZONE,

    -- Status & Metrics
    is_active BOOLEAN DEFAULT true,
    click_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_clicked_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for products
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_platform ON products(platform);
CREATE INDEX idx_products_source ON products(source);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_tags ON products USING GIN(tags);

-- Full-text search index
CREATE INDEX idx_products_search ON products USING GIN(
    to_tsvector('english', title || ' ' || COALESCE(description, ''))
);

-- ============================================
-- ANALYTICS TABLE
-- ============================================
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Event Information
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('view', 'click', 'conversion', 'share')),

    -- Visitor Information
    visitor_ip VARCHAR(45), -- IPv4 or IPv6
    visitor_id VARCHAR(255), -- Anonymous visitor tracking
    user_agent TEXT,
    referrer TEXT,

    -- Location Data (optional)
    country VARCHAR(2), -- ISO country code
    city VARCHAR(100),

    -- Additional Data
    metadata JSONB DEFAULT '{}', -- Flexible additional data

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX idx_analytics_product_id ON analytics(product_id);
CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);
CREATE INDEX idx_analytics_visitor_id ON analytics(visitor_id);

-- Partitioning by date for analytics (optional, for high-volume)
-- CREATE TABLE analytics_2025_12 PARTITION OF analytics
-- FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- ============================================
-- SESSIONS TABLE (Optional - for session management)
-- ============================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    refresh_token_hash VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for sessions
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliate_ids_updated_at BEFORE UPDATE ON affiliate_ids
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate slug for categories
CREATE OR REPLACE FUNCTION generate_category_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
        NEW.slug := trim(both '-' from NEW.slug);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER auto_generate_category_slug BEFORE INSERT OR UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION generate_category_slug();

-- Update product click_count on analytics insert
CREATE OR REPLACE FUNCTION update_product_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.event_type = 'click' THEN
        UPDATE products
        SET click_count = click_count + 1,
            last_clicked_at = NEW.created_at
        WHERE id = NEW.product_id;
    ELSIF NEW.event_type = 'view' THEN
        UPDATE products
        SET view_count = view_count + 1
        WHERE id = NEW.product_id;
    ELSIF NEW.event_type = 'conversion' THEN
        UPDATE products
        SET conversion_count = conversion_count + 1
        WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_metrics_trigger AFTER INSERT ON analytics
    FOR EACH ROW EXECUTE FUNCTION update_product_metrics();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Products policies
CREATE POLICY "Users can view own products" ON products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON products
    FOR DELETE USING (auth.uid() = user_id);

-- Public can view active products (for showcase pages)
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (is_active = true);

-- Categories policies
CREATE POLICY "Users can manage own categories" ON categories
    FOR ALL USING (auth.uid() = user_id);

-- Affiliate IDs policies
CREATE POLICY "Users can manage own affiliate IDs" ON affiliate_ids
    FOR ALL USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can view own analytics" ON analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert analytics" ON analytics
    FOR INSERT WITH CHECK (true);

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON sessions
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- VIEWS (for common queries)
-- ============================================

-- Product statistics per user
CREATE OR REPLACE VIEW user_product_stats AS
SELECT
    user_id,
    COUNT(*) as total_products,
    COUNT(*) FILTER (WHERE is_active = true) as active_products,
    SUM(click_count) as total_clicks,
    SUM(view_count) as total_views,
    SUM(conversion_count) as total_conversions,
    ROUND(AVG(rating), 2) as avg_rating
FROM products
GROUP BY user_id;

-- Analytics summary by product
CREATE OR REPLACE VIEW product_analytics_summary AS
SELECT
    p.id as product_id,
    p.user_id,
    p.title,
    COUNT(*) FILTER (WHERE a.event_type = 'view') as views,
    COUNT(*) FILTER (WHERE a.event_type = 'click') as clicks,
    COUNT(*) FILTER (WHERE a.event_type = 'conversion') as conversions,
    CASE
        WHEN COUNT(*) FILTER (WHERE a.event_type = 'view') > 0
        THEN ROUND(COUNT(*) FILTER (WHERE a.event_type = 'click')::numeric /
                   COUNT(*) FILTER (WHERE a.event_type = 'view') * 100, 2)
        ELSE 0
    END as ctr_percentage,
    CASE
        WHEN COUNT(*) FILTER (WHERE a.event_type = 'click') > 0
        THEN ROUND(COUNT(*) FILTER (WHERE a.event_type = 'conversion')::numeric /
                   COUNT(*) FILTER (WHERE a.event_type = 'click') * 100, 2)
        ELSE 0
    END as conversion_rate_percentage
FROM products p
LEFT JOIN analytics a ON p.id = a.product_id
GROUP BY p.id, p.user_id, p.title;

-- ============================================
-- FUNCTIONS (helper functions)
-- ============================================

-- Function to get user's total product count
CREATE OR REPLACE FUNCTION get_user_product_count(user_uuid UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM products WHERE user_id = user_uuid;
$$ LANGUAGE SQL;

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION check_product_limit(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_plan VARCHAR(20);
    product_count INTEGER;
BEGIN
    SELECT subscription_plan INTO user_plan FROM users WHERE id = user_uuid;
    SELECT COUNT(*) INTO product_count FROM products WHERE user_id = user_uuid;

    CASE user_plan
        WHEN 'free' THEN RETURN product_count < 50;
        WHEN 'pro' THEN RETURN true; -- Unlimited
        WHEN 'enterprise' THEN RETURN true; -- Unlimited
        ELSE RETURN false;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INITIAL DATA (optional seed data)
-- ============================================

-- Insert default categories (system-level, optional)
-- INSERT INTO categories (user_id, name, color, icon, is_active) VALUES
-- (NULL, 'Electronics', '#3B82F6', 'laptop', true),
-- (NULL, 'Fashion', '#EC4899', 'shirt', true),
-- (NULL, 'Home & Kitchen', '#F59E0B', 'home', true),
-- (NULL, 'Beauty', '#8B5CF6', 'sparkles', true),
-- (NULL, 'Sports & Fitness', '#10B981', 'dumbbell', true);
```

---

## Data Mapping

### localStorage → Neon Database

#### 1. Users Migration

**localStorage** (`shopmatic_auth`):
```typescript
{
  user: {
    id: "uuid",
    email: "user@example.com",
    name: "Demo User",
    plan: "free",
    createdAt: "2025-01-01T00:00:00Z"
  },
  timestamp: 1704067200000,
  expiresAt: 1704153600000,
  hash: "sha256hash..."
}
```

**Neon Database** (`users` table):
```sql
INSERT INTO users (id, email, username, first_name, password_hash, subscription_plan, created_at)
VALUES (
  'uuid',
  'user@example.com',
  'demouser',
  'Demo User',
  '$2b$10$...', -- bcrypt hash (new registration required)
  'free',
  '2025-01-01T00:00:00Z'
);
```

#### 2. Products Migration

**localStorage** (`shopmatic-products`):
```typescript
{
  id: "uuid",
  title: "Product Title",
  description: "Product description",
  price: 1999,
  currency: "INR",
  rating: 4.5,
  image: "https://example.com/image.jpg",
  link: "https://amazon.in/product?tag=affid",
  source: "Amazon",
  tags: ["electronics", "smart"],
  categories: ["Electronics"],
  createdAt: "2025-01-15T10:00:00Z"
}
```

**Neon Database** (`products` table):
```sql
INSERT INTO products (
  id, user_id, title, description, price, currency, rating,
  image_url, affiliate_url, original_url, source, platform,
  tags, extraction_method, is_active, created_at
)
VALUES (
  'uuid',
  'user_uuid', -- Associated user
  'Product Title',
  'Product description',
  1999.00,
  'INR',
  4.5,
  'https://example.com/image.jpg',
  'https://amazon.in/product?tag=affid',
  'https://amazon.in/product',
  'Amazon',
  'amazon',
  ARRAY['electronics', 'smart'],
  'manual',
  true,
  '2025-01-15T10:00:00Z'
);
```

**Category Association**:
```sql
-- First, create or find category
INSERT INTO categories (user_id, name, color)
VALUES ('user_uuid', 'Electronics', '#3B82F6')
ON CONFLICT (user_id, name) DO NOTHING
RETURNING id;

-- Then update product
UPDATE products
SET category_id = (SELECT id FROM categories WHERE user_id = 'user_uuid' AND name = 'Electronics')
WHERE id = 'product_uuid';
```

#### 3. Theme Settings Migration

**localStorage** (`shopmatic-theme`):
```typescript
{
  primaryColor: "#6366F1",
  secondaryColor: "#EC4899",
  accentColor: "#059669",
  textColor: "#1F2937",
  backgroundColor: "#FFFFFF"
}
```

**Neon Database** (`users.theme_settings` JSONB):
```sql
UPDATE users
SET theme_settings = '{
  "primaryColor": "#6366F1",
  "secondaryColor": "#EC4899",
  "accentColor": "#059669",
  "textColor": "#1F2937",
  "backgroundColor": "#FFFFFF"
}'::jsonb
WHERE id = 'user_uuid';
```

---

## Migration Scripts

### Script 1: Export localStorage Data

**File**: `scripts/export-localstorage.js`

```javascript
/**
 * Export localStorage Data
 * Run this in browser console to export all data
 */

function exportLocalStorageData() {
  const data = {
    products: [],
    theme: null,
    auth: null,
    apiKeys: null,
    cookiePreferences: null,
    exportDate: new Date().toISOString()
  };

  // Export products
  const productsRaw = localStorage.getItem('shopmatic-products');
  if (productsRaw) {
    try {
      data.products = JSON.parse(productsRaw);
      console.log(`✅ Exported ${data.products.length} products`);
    } catch (e) {
      console.error('❌ Failed to parse products:', e);
    }
  }

  // Export theme
  const themeRaw = localStorage.getItem('shopmatic-theme');
  if (themeRaw) {
    try {
      data.theme = JSON.parse(themeRaw);
      console.log('✅ Exported theme settings');
    } catch (e) {
      console.error('❌ Failed to parse theme:', e);
    }
  }

  // Export auth (encrypted - will need re-registration)
  const authRaw = localStorage.getItem('shopmatic_auth');
  if (authRaw) {
    try {
      data.auth = JSON.parse(authRaw);
      console.log('✅ Exported auth data (encrypted)');
    } catch (e) {
      console.error('❌ Failed to parse auth:', e);
    }
  }

  // Export cookie preferences
  const cookiePrefs = localStorage.getItem('shopmatic_cookie_preferences');
  if (cookiePrefs) {
    try {
      data.cookiePreferences = JSON.parse(cookiePrefs);
      console.log('✅ Exported cookie preferences');
    } catch (e) {
      console.error('❌ Failed to parse cookie preferences:', e);
    }
  }

  // Download as JSON
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ecomjunction-export-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);

  console.log('✅ Export complete! File downloaded.');
  return data;
}

// Run export
exportLocalStorageData();
```

### Script 2: Transform Data for Neon

**File**: `scripts/transform-data.ts`

```typescript
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

interface LocalStorageExport {
  products: any[];
  theme: any;
  auth: any;
  cookiePreferences: any;
  exportDate: string;
}

interface TransformedData {
  users: any[];
  products: any[];
  categories: any[];
  themeSettings: any;
}

/**
 * Transform localStorage export to Neon-compatible format
 */
function transformData(exportData: LocalStorageExport, userId: string): TransformedData {
  const transformed: TransformedData = {
    users: [],
    products: [],
    categories: [],
    themeSettings: null
  };

  // Extract unique categories from products
  const categorySet = new Set<string>();
  exportData.products.forEach(product => {
    product.categories?.forEach((cat: string) => categorySet.add(cat));
  });

  // Create category objects
  transformed.categories = Array.from(categorySet).map((name, index) => ({
    id: uuidv4(),
    user_id: userId,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    color: getColorForCategory(index),
    sort_order: index,
    is_active: true
  }));

  // Transform products
  transformed.products = exportData.products.map(product => {
    // Find category ID
    const categoryName = product.categories?.[0];
    const category = transformed.categories.find(c => c.name === categoryName);

    return {
      id: product.id,
      user_id: userId,
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency || 'USD',
      affiliate_url: product.link,
      original_url: extractOriginalUrl(product.link),
      image_url: product.image,
      category_id: category?.id || null,
      tags: product.tags || [],
      rating: product.rating || null,
      source: product.source || 'Other',
      platform: detectPlatform(product.link),
      extraction_method: 'manual', // Since these are from localStorage
      is_active: true,
      created_at: product.createdAt || new Date().toISOString()
    };
  });

  // Transform theme settings
  if (exportData.theme) {
    transformed.themeSettings = exportData.theme;
  }

  return transformed;
}

/**
 * Get color for category based on index
 */
function getColorForCategory(index: number): string {
  const colors = [
    '#3B82F6', // Blue
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#10B981', // Green
    '#8B5CF6', // Purple
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#F97316'  // Orange
  ];
  return colors[index % colors.length];
}

/**
 * Extract original URL (remove affiliate parameters)
 */
function extractOriginalUrl(affiliateUrl: string): string {
  try {
    const url = new URL(affiliateUrl);
    // Remove common affiliate parameters
    const affiliateParams = ['tag', 'affid', 'utm_source', 'utm_medium', 'utm_campaign'];
    affiliateParams.forEach(param => url.searchParams.delete(param));
    return url.toString();
  } catch (e) {
    return affiliateUrl;
  }
}

/**
 * Detect platform from URL
 */
function detectPlatform(url: string): string {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('amazon')) return 'amazon';
  if (lowerUrl.includes('flipkart')) return 'flipkart';
  if (lowerUrl.includes('myntra')) return 'myntra';
  if (lowerUrl.includes('nykaa')) return 'nykaa';
  return 'other';
}

// Main execution
const exportFile = process.argv[2];
if (!exportFile) {
  console.error('Usage: ts-node transform-data.ts <export-file.json> <user-id>');
  process.exit(1);
}

const userId = process.argv[3] || uuidv4();

const exportData: LocalStorageExport = JSON.parse(
  fs.readFileSync(exportFile, 'utf-8')
);

const transformed = transformData(exportData, userId);

// Write output
const outputFile = path.join(
  path.dirname(exportFile),
  `transformed-${path.basename(exportFile)}`
);

fs.writeFileSync(outputFile, JSON.stringify(transformed, null, 2));

console.log('✅ Transformation complete!');
console.log(`📊 Stats:`);
console.log(`  - Products: ${transformed.products.length}`);
console.log(`  - Categories: ${transformed.categories.length}`);
console.log(`  - Output: ${outputFile}`);
```

### Script 3: Import to Neon

**File**: `scripts/import-to-neon.ts`

```typescript
import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.NEON_DATABASE_URL!);

interface TransformedData {
  users: any[];
  products: any[];
  categories: any[];
  themeSettings: any;
}

/**
 * Import transformed data to Neon database
 */
async function importToNeon(data: TransformedData, userEmail: string, userName: string) {
  console.log('🚀 Starting import to Neon...');

  try {
    // 1. Create user (or update if exists)
    console.log('1️⃣ Creating/updating user...');

    const userId = data.products[0]?.user_id || data.categories[0]?.user_id;

    const userResult = await sql`
      INSERT INTO users (id, email, username, first_name, theme_settings, subscription_plan, created_at)
      VALUES (
        ${userId},
        ${userEmail},
        ${userEmail.split('@')[0]},
        ${userName},
        ${JSON.stringify(data.themeSettings)},
        'free',
        NOW()
      )
      ON CONFLICT (id) DO UPDATE
      SET theme_settings = ${JSON.stringify(data.themeSettings)}
      RETURNING id;
    `;

    console.log(`✅ User created/updated: ${userId}`);

    // 2. Import categories
    console.log(`2️⃣ Importing ${data.categories.length} categories...`);

    for (const category of data.categories) {
      await sql`
        INSERT INTO categories (id, user_id, name, slug, color, sort_order, is_active)
        VALUES (
          ${category.id},
          ${category.user_id},
          ${category.name},
          ${category.slug},
          ${category.color},
          ${category.sort_order},
          ${category.is_active}
        )
        ON CONFLICT (user_id, name) DO NOTHING;
      `;
    }

    console.log(`✅ Categories imported`);

    // 3. Import products
    console.log(`3️⃣ Importing ${data.products.length} products...`);

    let imported = 0;
    for (const product of data.products) {
      await sql`
        INSERT INTO products (
          id, user_id, title, description, price, currency,
          affiliate_url, original_url, image_url, category_id,
          tags, rating, source, platform, extraction_method,
          is_active, created_at
        )
        VALUES (
          ${product.id},
          ${product.user_id},
          ${product.title},
          ${product.description},
          ${product.price},
          ${product.currency},
          ${product.affiliate_url},
          ${product.original_url},
          ${product.image_url},
          ${product.category_id},
          ${product.tags},
          ${product.rating},
          ${product.source},
          ${product.platform},
          ${product.extraction_method},
          ${product.is_active},
          ${product.created_at}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
      imported++;

      if (imported % 10 === 0) {
        console.log(`  Progress: ${imported}/${data.products.length}`);
      }
    }

    console.log(`✅ Products imported: ${imported}`);

    // 4. Verify import
    console.log('4️⃣ Verifying import...');

    const stats = await sql`
      SELECT
        (SELECT COUNT(*) FROM products WHERE user_id = ${userId}) as product_count,
        (SELECT COUNT(*) FROM categories WHERE user_id = ${userId}) as category_count
    `;

    console.log('📊 Import Summary:');
    console.log(`  - Products: ${stats[0].product_count}`);
    console.log(`  - Categories: ${stats[0].category_count}`);
    console.log('✅ Import complete!');

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

// Main execution
const transformedFile = process.argv[2];
const userEmail = process.argv[3];
const userName = process.argv[4] || 'User';

if (!transformedFile || !userEmail) {
  console.error('Usage: ts-node import-to-neon.ts <transformed-file.json> <user-email> [user-name]');
  process.exit(1);
}

const data: TransformedData = JSON.parse(
  fs.readFileSync(transformedFile, 'utf-8')
);

importToNeon(data, userEmail, userName)
  .then(() => console.log('✅ Done!'))
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
```

---

## Backend API Design

### API Structure

```
ecomjunction-api/
├── src/
│   ├── routes/
│   │   ├── auth.ts          # Authentication endpoints
│   │   ├── users.ts         # User management
│   │   ├── products.ts      # Product CRUD
│   │   ├── categories.ts    # Category management
│   │   ├── analytics.ts     # Analytics endpoints
│   │   └── affiliate.ts     # Affiliate ID management
│   ├── middleware/
│   │   ├── auth.ts          # JWT verification
│   │   ├── validation.ts    # Request validation
│   │   ├── rateLimiting.ts  # Rate limiting
│   │   └── errorHandler.ts  # Error handling
│   ├── services/
│   │   ├── database.ts      # Neon connection
│   │   ├── jwt.ts           # JWT utilities
│   │   ├── email.ts         # Email service
│   │   └── openai.ts        # OpenAI proxy
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   └── index.ts             # Express app
├── .env
├── package.json
└── tsconfig.json
```

### Key Endpoints

#### Authentication
```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login user
POST   /api/auth/logout        # Logout user
POST   /api/auth/refresh       # Refresh JWT token
POST   /api/auth/forgot-password    # Request password reset
POST   /api/auth/reset-password     # Reset password
GET    /api/auth/verify-email       # Verify email address
```

#### Users
```
GET    /api/users/me           # Get current user
PUT    /api/users/me           # Update current user
DELETE /api/users/me           # Delete account
PUT    /api/users/me/theme     # Update theme settings
GET    /api/users/me/stats     # Get user statistics
```

#### Products
```
GET    /api/products           # List products (paginated, filtered)
POST   /api/products           # Create product
GET    /api/products/:id       # Get product by ID
PUT    /api/products/:id       # Update product
DELETE /api/products/:id       # Delete product
POST   /api/products/extract   # Extract product from URL (AI)
POST   /api/products/bulk      # Bulk operations
```

#### Categories
```
GET    /api/categories         # List categories
POST   /api/categories         # Create category
PUT    /api/categories/:id     # Update category
DELETE /api/categories/:id     # Delete category
```

#### Analytics
```
POST   /api/analytics/track    # Track event (view, click, conversion)
GET    /api/analytics/products # Product analytics
GET    /api/analytics/overview # Dashboard overview
GET    /api/analytics/export   # Export analytics data
```

#### Affiliate IDs
```
GET    /api/affiliate-ids      # List affiliate IDs
POST   /api/affiliate-ids      # Create affiliate ID
PUT    /api/affiliate-ids/:id  # Update affiliate ID
DELETE /api/affiliate-ids/:id  # Delete affiliate ID
```

### Example Implementation

**File**: `src/routes/products.ts`

```typescript
import { Router } from 'express';
import { sql } from '../services/database';
import { authenticateJWT } from '../middleware/auth';
import { validateProduct } from '../middleware/validation';

const router = Router();

// List products
router.get('/', authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, category, search, sortBy = 'created_at' } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  let query = sql`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.user_id = ${userId}
  `;

  if (category) {
    query = sql`${query} AND p.category_id = ${category}`;
  }

  if (search) {
    query = sql`${query} AND (p.title ILIKE ${'%' + search + '%'} OR p.description ILIKE ${'%' + search + '%'})`;
  }

  query = sql`${query} ORDER BY p.${sql(sortBy)} DESC LIMIT ${limit} OFFSET ${offset}`;

  const products = await query;
  const total = await sql`SELECT COUNT(*) FROM products WHERE user_id = ${userId}`;

  res.json({
    products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: total[0].count,
      pages: Math.ceil(total[0].count / Number(limit))
    }
  });
});

// Create product
router.post('/', authenticateJWT, validateProduct, async (req, res) => {
  const userId = req.user.id;

  // Check product limit
  const canAdd = await sql`SELECT check_product_limit(${userId}) as can_add`;
  if (!canAdd[0].can_add) {
    return res.status(403).json({ error: 'Product limit reached for your plan' });
  }

  const product = await sql`
    INSERT INTO products (
      user_id, title, description, price, currency,
      affiliate_url, image_url, category_id, tags, rating, source
    )
    VALUES (
      ${userId},
      ${req.body.title},
      ${req.body.description},
      ${req.body.price},
      ${req.body.currency},
      ${req.body.affiliate_url},
      ${req.body.image_url},
      ${req.body.category_id},
      ${req.body.tags},
      ${req.body.rating},
      ${req.body.source}
    )
    RETURNING *;
  `;

  res.status(201).json(product[0]);
});

export default router;
```

---

## Frontend Changes

### 1. Create API Service

**File**: `src/services/api.ts`

```typescript
import axios, { AxiosInstance } from 'axios';

class APIService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth token to requests
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token refresh
    this.client.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401) {
          // Token expired, try refresh
          await this.refreshToken();
        }
        return Promise.reject(error);
      }
    );
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return;

    try {
      const response = await this.client.post('/auth/refresh', { refreshToken });
      localStorage.setItem('auth_token', response.data.token);
    } catch (error) {
      // Refresh failed, logout user
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
  }

  // Auth endpoints
  auth = {
    register: (data: any) => this.client.post('/auth/register', data),
    login: (data: any) => this.client.post('/auth/login', data),
    logout: () => this.client.post('/auth/logout'),
    me: () => this.client.get('/auth/me')
  };

  // Product endpoints
  products = {
    list: (params?: any) => this.client.get('/products', { params }),
    get: (id: string) => this.client.get(`/products/${id}`),
    create: (data: any) => this.client.post('/products', data),
    update: (id: string, data: any) => this.client.put(`/products/${id}`, data),
    delete: (id: string) => this.client.delete(`/products/${id}`),
    extract: (url: string) => this.client.post('/products/extract', { url })
  };

  // Category endpoints
  categories = {
    list: () => this.client.get('/categories'),
    create: (data: any) => this.client.post('/categories', data),
    update: (id: string, data: any) => this.client.put(`/categories/${id}`, data),
    delete: (id: string) => this.client.delete(`/categories/${id}`)
  };

  // Analytics endpoints
  analytics = {
    track: (data: any) => this.client.post('/analytics/track', data),
    overview: () => this.client.get('/analytics/overview'),
    products: () => this.client.get('/analytics/products')
  };
}

export const api = new APIService();
```

### 2. Update ProductContext

**File**: `src/contexts/ProductContext.tsx` (updated)

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Product } from '../types';

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  error: Error | null;
  addProduct: (product: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  // ... other methods
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.products.list();
      return response.data.products;
    }
  });

  // Create product
  const createMutation = useMutation({
    mutationFn: (product: Partial<Product>) => api.products.create(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  // Update product
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      api.products.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  // Delete product
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.products.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const value = {
    products,
    isLoading,
    error: error as Error | null,
    addProduct: async (product) => {
      await createMutation.mutateAsync(product);
    },
    updateProduct: async (id, product) => {
      await updateMutation.mutateAsync({ id, data: product });
    },
    removeProduct: async (id) => {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within ProductProvider');
  return context;
};
```

---

## Testing Strategy

### 1. Database Testing

```typescript
// Test database connection
describe('Database Connection', () => {
  it('should connect to Neon database', async () => {
    const result = await sql`SELECT NOW()`;
    expect(result).toBeDefined();
  });
});

// Test migrations
describe('Database Schema', () => {
  it('should have all required tables', async () => {
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;

    const tableNames = tables.map(t => t.table_name);
    expect(tableNames).toContain('users');
    expect(tableNames).toContain('products');
    expect(tableNames).toContain('categories');
    expect(tableNames).toContain('analytics');
  });
});
```

### 2. API Testing

```typescript
// Test product endpoints
describe('Product API', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Create test user and get token
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

    authToken = response.body.token;
    userId = response.body.user.id;
  });

  it('should create a product', async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Product',
        description: 'Test description',
        price: 99.99,
        currency: 'USD',
        affiliate_url: 'https://example.com/product'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('should list products', async () => {
    const response = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.products).toBeInstanceOf(Array);
  });
});
```

### 3. Integration Testing

```typescript
// Test data migration
describe('Data Migration', () => {
  it('should migrate localStorage products to database', async () => {
    const localStorageProducts = [
      { id: 'uuid1', title: 'Product 1', /* ... */ },
      { id: 'uuid2', title: 'Product 2', /* ... */ }
    ];

    // Transform and import
    const transformed = transformData({ products: localStorageProducts }, userId);
    await importToNeon(transformed, 'user@example.com', 'User');

    // Verify
    const dbProducts = await sql`SELECT * FROM products WHERE user_id = ${userId}`;
    expect(dbProducts.length).toBe(2);
  });
});
```

---

## Rollout Plan

### Week 1: Infrastructure Setup

**Day 1-2: Neon Database**
- [ ] Create Neon project
- [ ] Run schema migrations
- [ ] Set up connection pooling
- [ ] Configure environment variables

**Day 3-4: Backend Development**
- [ ] Initialize Express.js project
- [ ] Set up TypeScript
- [ ] Implement authentication routes
- [ ] Implement product routes

**Day 5-7: Testing**
- [ ] Write API tests
- [ ] Test database connections
- [ ] Load testing
- [ ] Security testing

### Week 2: Migration & Integration

**Day 1-2: Data Migration**
- [ ] Create migration scripts
- [ ] Test migration with sample data
- [ ] Migrate existing users
- [ ] Verify data integrity

**Day 3-5: Frontend Integration**
- [ ] Create API service layer
- [ ] Update contexts
- [ ] Implement loading states
- [ ] Error handling

**Day 6-7: Testing**
- [ ] End-to-end testing
- [ ] User acceptance testing
- [ ] Performance testing

### Week 3: Deployment & Monitoring

**Day 1-3: Deployment**
- [ ] Deploy backend (Vercel/Railway)
- [ ] Update frontend environment variables
- [ ] Configure CORS
- [ ] SSL certificates

**Day 4-5: Monitoring**
- [ ] Set up error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Database monitoring
- [ ] Usage analytics

**Day 6-7: Support**
- [ ] User migration support
- [ ] Bug fixes
- [ ] Documentation updates

---

## Rollback Plan

### If Migration Fails

**Immediate Rollback (< 24 hours)**
1. Revert frontend to localStorage version
2. Keep database for future migration
3. Investigate issues
4. Fix and retry

**Partial Rollback (Issues with specific features)**
1. Keep working features on database
2. Revert problematic features to localStorage
3. Gradual migration approach

**Data Recovery**
1. All migrations create backups
2. localStorage data preserved
3. Database exports before changes

### Contingency Plan

**Backup Strategy**
- Automated daily database backups
- localStorage export functionality
- Manual export before migration

**Testing Environment**
- Staging environment mirrors production
- All migrations tested in staging first
- User acceptance testing

**Support Plan**
- Migration support documentation
- FAQ for common issues
- Support email/chat for users

---

## Conclusion

This migration plan provides a comprehensive roadmap for transitioning eComJunction from localStorage to Neon PostgreSQL. The three-phase approach ensures minimal disruption while enabling scalability and advanced features.

**Next Steps:**
1. Review and approve this migration plan
2. Set up Neon database
3. Begin backend API development
4. Test migration scripts with sample data
5. Execute phased rollout

**Estimated Timeline:** 3 weeks
**Risk Level:** Medium
**Benefit:** High - Enables true SAAS functionality

---

**Document Version:** 1.0
**Date:** December 22, 2025
**Author:** Development Team
