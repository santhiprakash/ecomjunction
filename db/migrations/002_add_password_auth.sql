-- Add password_hash column for JWT auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Make clerk_id optional since we now support both Clerk and JWT auth
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;

-- Note: The id column is still UUID but can be either:
-- 1. A Clerk user ID (for Clerk auth)
-- 2. A generated UUID (for JWT auth)
