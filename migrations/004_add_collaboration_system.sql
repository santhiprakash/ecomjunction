-- Migration: Add Collaboration System for Team Management
-- Version: 004
-- Description: Adds page-level collaboration, invitations, and team member management

-- ============================================================================
-- STEP 1: Create page_collaborators table
-- ============================================================================

CREATE TABLE IF NOT EXISTS page_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '{}', -- For granular permission overrides
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure user can only have one role per page
    UNIQUE(page_id, user_id)
);

-- ============================================================================
-- STEP 2: Create page_invitations table (for pending invites)
-- ============================================================================

CREATE TABLE IF NOT EXISTS page_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')), -- Cannot invite as owner
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted BOOLEAN DEFAULT false,
    accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Prevent duplicate pending invitations
    UNIQUE(page_id, email, accepted)
);

-- ============================================================================
-- STEP 3: Create team_member_limits table (track team size per page)
-- ============================================================================

CREATE TABLE IF NOT EXISTS team_member_limits (
    page_id UUID PRIMARY KEY REFERENCES pages(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 0, -- Free: 0, Pro: 3, Enterprise: -1 (unlimited)
    current_members INTEGER DEFAULT 1, -- Starts with 1 (owner)
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: Create activity_log table (audit trail for collaboration)
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'member_invited', 'member_added', 'member_removed', 'role_changed', etc.
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 5: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_page_collaborators_page_id ON page_collaborators(page_id);
CREATE INDEX IF NOT EXISTS idx_page_collaborators_user_id ON page_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_page_collaborators_role ON page_collaborators(role);
CREATE INDEX IF NOT EXISTS idx_page_collaborators_is_active ON page_collaborators(is_active);

CREATE INDEX IF NOT EXISTS idx_page_invitations_page_id ON page_invitations(page_id);
CREATE INDEX IF NOT EXISTS idx_page_invitations_email ON page_invitations(email);
CREATE INDEX IF NOT EXISTS idx_page_invitations_token ON page_invitations(token);
CREATE INDEX IF NOT EXISTS idx_page_invitations_expires_at ON page_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_page_invitations_accepted ON page_invitations(accepted);

CREATE INDEX IF NOT EXISTS idx_activity_log_page_id ON activity_log(page_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

-- ============================================================================
-- STEP 6: Create triggers
-- ============================================================================

-- Trigger for page_collaborators updated_at
DROP TRIGGER IF EXISTS update_page_collaborators_updated_at ON page_collaborators;
CREATE TRIGGER update_page_collaborators_updated_at BEFORE UPDATE ON page_collaborators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for team_member_limits updated_at
DROP TRIGGER IF EXISTS update_team_member_limits_updated_at ON team_member_limits;
CREATE TRIGGER update_team_member_limits_updated_at BEFORE UPDATE ON team_member_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 7: Helper functions
-- ============================================================================

-- Function to automatically add page creator as owner
CREATE OR REPLACE FUNCTION add_page_owner_as_collaborator()
RETURNS TRIGGER AS $$
BEGIN
    -- Add page creator as owner
    INSERT INTO page_collaborators (page_id, user_id, role, invited_by, accepted_at)
    VALUES (NEW.id, NEW.user_id, 'owner', NEW.user_id, NOW());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-add owner when page is created
DROP TRIGGER IF EXISTS trigger_add_page_owner ON pages;
CREATE TRIGGER trigger_add_page_owner
    AFTER INSERT ON pages
    FOR EACH ROW
    EXECUTE FUNCTION add_page_owner_as_collaborator();

-- Function to initialize team member limits when page is created
CREATE OR REPLACE FUNCTION initialize_team_member_limits()
RETURNS TRIGGER AS $$
DECLARE
    user_plan VARCHAR(20);
    max_members_allowed INTEGER;
BEGIN
    -- Get user's subscription plan
    SELECT subscription_plan INTO user_plan
    FROM users
    WHERE id = NEW.user_id;

    -- Set max members based on plan
    max_members_allowed := CASE user_plan
        WHEN 'free' THEN 0
        WHEN 'pro' THEN 3
        WHEN 'enterprise' THEN -1  -- -1 means unlimited
        ELSE 0
    END;

    -- Initialize team member limits
    INSERT INTO team_member_limits (page_id, max_members, current_members)
    VALUES (NEW.id, max_members_allowed, 1); -- Starts with 1 (owner)

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for initializing team limits
DROP TRIGGER IF EXISTS trigger_initialize_team_limits ON pages;
CREATE TRIGGER trigger_initialize_team_limits
    AFTER INSERT ON pages
    FOR EACH ROW
    EXECUTE FUNCTION initialize_team_member_limits();

-- Function to update team member limits when plan changes
CREATE OR REPLACE FUNCTION update_team_limits_on_plan_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.subscription_plan != OLD.subscription_plan THEN
        -- Update team limits for all pages owned by this user
        UPDATE team_member_limits
        SET max_members = CASE NEW.subscription_plan
            WHEN 'free' THEN 0
            WHEN 'pro' THEN 3
            WHEN 'enterprise' THEN -1
            ELSE 0
        END,
        last_updated = NOW()
        WHERE page_id IN (
            SELECT id FROM pages WHERE user_id = NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for plan changes
DROP TRIGGER IF EXISTS trigger_update_team_limits ON users;
CREATE TRIGGER trigger_update_team_limits
    AFTER UPDATE OF subscription_plan ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_team_limits_on_plan_change();

-- Function to increment team member count when collaborator is added
CREATE OR REPLACE FUNCTION increment_team_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role != 'owner' AND NEW.is_active = true THEN
        UPDATE team_member_limits
        SET current_members = current_members + 1,
            last_updated = NOW()
        WHERE page_id = NEW.page_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for adding collaborators
DROP TRIGGER IF EXISTS trigger_increment_team_count ON page_collaborators;
CREATE TRIGGER trigger_increment_team_count
    AFTER INSERT ON page_collaborators
    FOR EACH ROW
    EXECUTE FUNCTION increment_team_member_count();

-- Function to decrement team member count when collaborator is removed
CREATE OR REPLACE FUNCTION decrement_team_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role != 'owner' AND OLD.is_active = true THEN
        UPDATE team_member_limits
        SET current_members = GREATEST(1, current_members - 1), -- Never go below 1 (owner)
            last_updated = NOW()
        WHERE page_id = OLD.page_id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for removing collaborators
DROP TRIGGER IF EXISTS trigger_decrement_team_count ON page_collaborators;
CREATE TRIGGER trigger_decrement_team_count
    AFTER DELETE ON page_collaborators
    FOR EACH ROW
    EXECUTE FUNCTION decrement_team_member_count();

-- Function to handle collaborator status changes (activate/deactivate)
CREATE OR REPLACE FUNCTION handle_collaborator_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active != OLD.is_active AND NEW.role != 'owner' THEN
        IF NEW.is_active = true THEN
            -- Reactivating member
            UPDATE team_member_limits
            SET current_members = current_members + 1,
                last_updated = NOW()
            WHERE page_id = NEW.page_id;
        ELSE
            -- Deactivating member
            UPDATE team_member_limits
            SET current_members = GREATEST(1, current_members - 1),
                last_updated = NOW()
            WHERE page_id = NEW.page_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status changes
DROP TRIGGER IF EXISTS trigger_handle_status_change ON page_collaborators;
CREATE TRIGGER trigger_handle_status_change
    AFTER UPDATE OF is_active ON page_collaborators
    FOR EACH ROW
    EXECUTE FUNCTION handle_collaborator_status_change();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_collaboration_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO activity_log (page_id, user_id, action, target_user_id, metadata)
        VALUES (
            NEW.page_id,
            NEW.invited_by,
            'member_added',
            NEW.user_id,
            jsonb_build_object('role', NEW.role)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.role != OLD.role THEN
            INSERT INTO activity_log (page_id, user_id, action, target_user_id, metadata)
            VALUES (
                NEW.page_id,
                NEW.invited_by,
                'role_changed',
                NEW.user_id,
                jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role)
            );
        END IF;
        IF NEW.is_active != OLD.is_active THEN
            INSERT INTO activity_log (page_id, user_id, action, target_user_id, metadata)
            VALUES (
                NEW.page_id,
                COALESCE(NEW.invited_by, NEW.user_id),
                CASE WHEN NEW.is_active THEN 'member_activated' ELSE 'member_deactivated' END,
                NEW.user_id,
                '{}'::jsonb
            );
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO activity_log (page_id, user_id, action, target_user_id, metadata)
        VALUES (
            OLD.page_id,
            OLD.invited_by,
            'member_removed',
            OLD.user_id,
            jsonb_build_object('role', OLD.role)
        );
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for activity logging
DROP TRIGGER IF EXISTS trigger_log_collaboration_activity ON page_collaborators;
CREATE TRIGGER trigger_log_collaboration_activity
    AFTER INSERT OR UPDATE OR DELETE ON page_collaborators
    FOR EACH ROW
    EXECUTE FUNCTION log_collaboration_activity();

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
    DELETE FROM page_invitations
    WHERE expires_at < NOW() AND accepted = false;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 8: Initialize data for existing pages
-- ============================================================================

-- Add page owners as collaborators for existing pages (if not already added)
INSERT INTO page_collaborators (page_id, user_id, role, invited_by, accepted_at)
SELECT
    p.id,
    p.user_id,
    'owner',
    p.user_id,
    NOW()
FROM pages p
WHERE NOT EXISTS (
    SELECT 1 FROM page_collaborators pc
    WHERE pc.page_id = p.id AND pc.user_id = p.user_id AND pc.role = 'owner'
)
ON CONFLICT (page_id, user_id) DO NOTHING;

-- Initialize team member limits for existing pages
INSERT INTO team_member_limits (page_id, max_members, current_members)
SELECT
    p.id,
    CASE u.subscription_plan
        WHEN 'free' THEN 0
        WHEN 'pro' THEN 3
        WHEN 'enterprise' THEN -1
        ELSE 0
    END,
    1 -- Owner only
FROM pages p
JOIN users u ON p.user_id = u.id
WHERE NOT EXISTS (
    SELECT 1 FROM team_member_limits tml WHERE tml.page_id = p.id
)
ON CONFLICT (page_id) DO NOTHING;

-- ============================================================================
-- STEP 9: Add comments for documentation
-- ============================================================================

COMMENT ON TABLE page_collaborators IS 'Manages team members and their roles for each page';
COMMENT ON COLUMN page_collaborators.role IS 'Page-level role: owner (creator), admin (full access), editor (products only), viewer (read-only)';
COMMENT ON COLUMN page_collaborators.permissions IS 'JSONB for granular permission overrides beyond the default role permissions';

COMMENT ON TABLE page_invitations IS 'Pending invitations for team members (email-based invites)';
COMMENT ON COLUMN page_invitations.token IS 'Unique token for accepting the invitation via email link';
COMMENT ON COLUMN page_invitations.expires_at IS 'Invitations expire after 7 days by default';

COMMENT ON TABLE team_member_limits IS 'Tracks team size limits per page based on subscription plan';
COMMENT ON COLUMN team_member_limits.max_members IS 'Maximum team members allowed (0=solo, 3=pro, -1=unlimited)';
COMMENT ON COLUMN team_member_limits.current_members IS 'Current number of active team members including owner';

COMMENT ON TABLE activity_log IS 'Audit trail for collaboration activities (add/remove members, role changes, etc.)';

-- Migration complete
