-- =====================================================
-- IN-APP NOTIFICATIONS TABLE (BELL ICON)
-- Purpose: Store bell icon notifications (NOT push notifications)
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- Step 1: Drop table if exists (untuk clean install)
DROP TABLE IF EXISTS notifications CASCADE;

-- Step 2: Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Target user
  user_id UUID NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'guru',
  
  -- Notification content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  
  -- Related data
  reference_id TEXT,
  reference_table TEXT,
  
  -- Sender info
  sender_name TEXT,
  sender_id UUID,
  
  -- Action URL
  action_url TEXT,
  
  -- Status
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Create indexes for better performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Step 4: Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies
-- Policy: Users can view own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Authenticated users can create notifications
CREATE POLICY "Authenticated users can create notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Step 6: Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger for auto-update
DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Step 8: Add comments for documentation
COMMENT ON TABLE notifications IS 'In-app notifications for bell icon (NOT push notifications)';
COMMENT ON COLUMN notifications.user_role IS 'Target user role: guru or siswa';
COMMENT ON COLUMN notifications.type IS 'Notification type: logbook, magang, dudi, approval, etc';
COMMENT ON COLUMN notifications.is_read IS 'Whether notification has been read';

-- =====================================================
-- DONE! Table notifications created successfully
-- =====================================================
