-- Migration: Add Pages System and Role-Based Access Control
-- Version: 003
-- Description: Adds pages table for shareable storefronts, user roles, and enhanced analytics

-- ============================================================================
-- STEP 1: Add role column to users table
-- ============================================================================

-- Add role column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users
    ADD COLUMN role VARCHAR(20) DEFAULT 'affiliate_marketer'
    CHECK (role IN ('admin', 'affiliate_marketer', 'end_user'));
  END IF;
END $$;

-- Set default role for existing users
UPDATE users SET role = 'affiliate_marketer' WHERE role IS NULL;

-- ============================================================================
-- STEP 2: Create pages table (shareable storefronts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slug VARCHAR(30) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    bio TEXT,
    avatar_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    theme_settings JSONB DEFAULT '{}',
    social_links JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT slug_length CHECK (char_length(slug) >= 5 AND char_length(slug) <= 30),
    CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'),
    CONSTRAINT title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 100)
);

-- ============================================================================
-- STEP 3: Create page_products junction table
-- ============================================================================

CREATE TABLE IF NOT EXISTS page_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Prevent duplicate products on same page
    UNIQUE(page_id, product_id)
);

-- ============================================================================
-- STEP 4: Create user_page_limits table (track page creation limits)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_page_limits (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    max_pages INTEGER DEFAULT 1, -- Free: 1, Pro: 5, Enterprise: Unlimited (-1)
    pages_created INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 5: Enhance analytics table for better device tracking
-- ============================================================================

-- Add new columns to analytics table if they don't exist
DO $$
BEGIN
  -- device_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics' AND column_name = 'device_type'
  ) THEN
    ALTER TABLE analytics
    ADD COLUMN device_type VARCHAR(20) CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'unknown'));
  END IF;

  -- page_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics' AND column_name = 'page_id'
  ) THEN
    ALTER TABLE analytics
    ADD COLUMN page_id UUID REFERENCES pages(id) ON DELETE CASCADE;
  END IF;

  -- browser column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics' AND column_name = 'browser'
  ) THEN
    ALTER TABLE analytics ADD COLUMN browser VARCHAR(50);
  END IF;

  -- os column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics' AND column_name = 'os'
  ) THEN
    ALTER TABLE analytics ADD COLUMN os VARCHAR(50);
  END IF;

  -- country column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics' AND column_name = 'country'
  ) THEN
    ALTER TABLE analytics ADD COLUMN country VARCHAR(3);
  END IF;

  -- session_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE analytics ADD COLUMN session_id UUID;
  END IF;

  -- url column (to track specific page URLs)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics' AND column_name = 'url'
  ) THEN
    ALTER TABLE analytics ADD COLUMN url TEXT;
  END IF;
END $$;

-- ============================================================================
-- STEP 6: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_is_active ON pages(is_active);
CREATE INDEX IF NOT EXISTS idx_pages_is_public ON pages(is_public);
CREATE INDEX IF NOT EXISTS idx_pages_created_at ON pages(created_at);

CREATE INDEX IF NOT EXISTS idx_page_products_page_id ON page_products(page_id);
CREATE INDEX IF NOT EXISTS idx_page_products_product_id ON page_products(product_id);
CREATE INDEX IF NOT EXISTS idx_page_products_display_order ON page_products(display_order);

CREATE INDEX IF NOT EXISTS idx_analytics_page_id ON analytics(page_id);
CREATE INDEX IF NOT EXISTS idx_analytics_device_type ON analytics(device_type);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_browser ON analytics(browser);

CREATE INDEX IF NOT EXISTS idx_user_page_limits_user_id ON user_page_limits(user_id);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================================
-- STEP 7: Create triggers for updated_at
-- ============================================================================

-- Trigger for pages updated_at
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_page_limits updated_at
DROP TRIGGER IF EXISTS update_user_page_limits_updated_at ON user_page_limits;
CREATE TRIGGER update_user_page_limits_updated_at BEFORE UPDATE ON user_page_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 8: Create helper functions
-- ============================================================================

-- Function to initialize page limits for new users
CREATE OR REPLACE FUNCTION initialize_user_page_limits()
RETURNS TRIGGER AS $$
BEGIN
    -- Set max_pages based on subscription plan
    INSERT INTO user_page_limits (user_id, max_pages)
    VALUES (
        NEW.id,
        CASE NEW.subscription_plan
            WHEN 'free' THEN 1
            WHEN 'pro' THEN 5
            WHEN 'enterprise' THEN -1  -- -1 means unlimited
            ELSE 1
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-initialize page limits for new users
DROP TRIGGER IF EXISTS trigger_initialize_page_limits ON users;
CREATE TRIGGER trigger_initialize_page_limits
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION initialize_user_page_limits();

-- Function to update page limits when subscription plan changes
CREATE OR REPLACE FUNCTION update_page_limits_on_plan_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subscription_plan != OLD.subscription_plan THEN
        UPDATE user_page_limits
        SET max_pages = CASE NEW.subscription_plan
            WHEN 'free' THEN 1
            WHEN 'pro' THEN 5
            WHEN 'enterprise' THEN -1
            ELSE 1
        END,
        last_updated = NOW()
        WHERE user_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for plan changes
DROP TRIGGER IF EXISTS trigger_update_page_limits ON users;
CREATE TRIGGER trigger_update_page_limits
    AFTER UPDATE OF subscription_plan ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_page_limits_on_plan_change();

-- Function to increment page count when creating a page
CREATE OR REPLACE FUNCTION increment_page_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_page_limits
    SET pages_created = pages_created + 1,
        last_updated = NOW()
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for page creation
DROP TRIGGER IF EXISTS trigger_increment_page_count ON pages;
CREATE TRIGGER trigger_increment_page_count
    AFTER INSERT ON pages
    FOR EACH ROW
    EXECUTE FUNCTION increment_page_count();

-- Function to decrement page count when deleting a page
CREATE OR REPLACE FUNCTION decrement_page_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_page_limits
    SET pages_created = GREATEST(0, pages_created - 1),
        last_updated = NOW()
    WHERE user_id = OLD.user_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for page deletion
DROP TRIGGER IF EXISTS trigger_decrement_page_count ON pages;
CREATE TRIGGER trigger_decrement_page_count
    AFTER DELETE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION decrement_page_count();

-- Function to increment page view count
CREATE OR REPLACE FUNCTION increment_page_views()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.event_type = 'view' AND NEW.page_id IS NOT NULL THEN
        UPDATE pages
        SET view_count = view_count + 1
        WHERE id = NEW.page_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for page views
DROP TRIGGER IF EXISTS trigger_increment_page_views ON analytics;
CREATE TRIGGER trigger_increment_page_views
    AFTER INSERT ON analytics
    FOR EACH ROW
    EXECUTE FUNCTION increment_page_views();

-- ============================================================================
-- STEP 9: Reserved slugs (prevent conflicts with app routes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS reserved_slugs (
    slug VARCHAR(30) PRIMARY KEY,
    reason VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert reserved slugs
INSERT INTO reserved_slugs (slug, reason) VALUES
    ('dashboard', 'Application route'),
    ('login', 'Application route'),
    ('signup', 'Application route'),
    ('admin', 'Application route'),
    ('api', 'API endpoint'),
    ('settings', 'Application route'),
    ('profile', 'Application route'),
    ('my-products', 'Application route'),
    ('analytics', 'Application route'),
    ('help', 'Application route'),
    ('help-center', 'Application route'),
    ('about', 'Application route'),
    ('about-us', 'Application route'),
    ('pricing', 'Application route'),
    ('features', 'Application route'),
    ('privacy', 'Application route'),
    ('privacy-policy', 'Application route'),
    ('privacy-settings', 'Application route'),
    ('terms', 'Application route'),
    ('terms-of-service', 'Application route'),
    ('cookies', 'Application route'),
    ('documentation', 'Application route'),
    ('docs', 'Application route'),
    ('support', 'Application route'),
    ('contact', 'Application route'),
    ('account', 'Application route'),
    ('billing', 'Application route'),
    ('pages', 'Application route'),
    ('create-page', 'Application route'),
    ('manage-pages', 'Application route')
ON CONFLICT (slug) DO NOTHING;

-- Function to check if slug is reserved
CREATE OR REPLACE FUNCTION check_reserved_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM reserved_slugs WHERE slug = NEW.slug) THEN
        RAISE EXCEPTION 'Slug "%" is reserved and cannot be used', NEW.slug;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent reserved slugs
DROP TRIGGER IF EXISTS trigger_check_reserved_slug ON pages;
CREATE TRIGGER trigger_check_reserved_slug
    BEFORE INSERT OR UPDATE OF slug ON pages
    FOR EACH ROW
    EXECUTE FUNCTION check_reserved_slug();

-- ============================================================================
-- STEP 10: Initialize page limits for existing users
-- ============================================================================

-- Add page limits for existing users who don't have them
INSERT INTO user_page_limits (user_id, max_pages, pages_created)
SELECT
    u.id,
    CASE u.subscription_plan
        WHEN 'free' THEN 1
        WHEN 'pro' THEN 5
        WHEN 'enterprise' THEN -1
        ELSE 1
    END,
    0
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_page_limits upl WHERE upl.user_id = u.id
);

-- ============================================================================
-- STEP 11: Add comments for documentation
-- ============================================================================

COMMENT ON TABLE pages IS 'User-created shareable pages (storefronts) with custom slugs';
COMMENT ON COLUMN pages.slug IS 'Custom URL slug (5-30 chars, lowercase alphanumeric + hyphens)';
COMMENT ON COLUMN pages.view_count IS 'Total number of page views (incremented by analytics trigger)';

COMMENT ON TABLE page_products IS 'Junction table linking products to pages with display order';
COMMENT ON COLUMN page_products.display_order IS 'Order in which products appear on the page (0 = first)';

COMMENT ON TABLE user_page_limits IS 'Tracks page creation limits per user based on subscription plan';
COMMENT ON COLUMN user_page_limits.max_pages IS 'Maximum pages allowed (-1 = unlimited, 1 = free, 5 = pro)';

COMMENT ON TABLE reserved_slugs IS 'Slugs that cannot be used for pages (reserved for app routes)';

COMMENT ON COLUMN users.role IS 'User role: admin (platform owner), affiliate_marketer (creator), end_user (visitor)';

COMMENT ON COLUMN analytics.device_type IS 'Device type: mobile, tablet, desktop, unknown';
COMMENT ON COLUMN analytics.page_id IS 'Reference to the page where the event occurred';
COMMENT ON COLUMN analytics.session_id IS 'Session identifier for grouping related events';

-- Migration complete
