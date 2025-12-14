-- Migration: Add admin role and analytics tables
-- This migration adds support for admin users and analytics tracking

-- Step 1: Alter the users table role enum to include 'admin'
-- Note: In PostgreSQL, we need to add the new value to the enum type
-- The role column uses a text type with check constraint, so we update the constraint

-- First, drop the existing check constraint if it exists
-- (Drizzle may have created one, or it might be an enum)

-- Add 'admin' to the role enum/constraint
-- This depends on how the column was created. If using text with enum validation:
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'company', 'admin'));

-- Step 2: Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index for faster queries by event type and date
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);

-- Step 3: Create analytics_aggregates table
CREATE TABLE IF NOT EXISTS analytics_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_value REAL NOT NULL,
  dimension JSONB,
  period TEXT NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index for faster aggregate queries
CREATE INDEX IF NOT EXISTS idx_analytics_aggregates_type_period ON analytics_aggregates(metric_type, period);
CREATE INDEX IF NOT EXISTS idx_analytics_aggregates_period_type ON analytics_aggregates(period_type);

-- Step 4: Create admin_actions table (audit log)
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index for audit log queries
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_actions_type ON admin_actions(action_type);

-- Step 5: Add comment to document the migration
COMMENT ON TABLE analytics_events IS 'Tracks all user actions for analytics and insights';
COMMENT ON TABLE analytics_aggregates IS 'Pre-computed metrics for dashboard performance';
COMMENT ON TABLE admin_actions IS 'Audit log for all admin operations';
