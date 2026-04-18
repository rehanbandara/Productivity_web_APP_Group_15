-- Manual SQL script to add missing columns to timer_sessions table
-- Run this script directly in your MySQL database

-- First, check if columns exist and add them if they don't
ALTER TABLE timer_sessions 
ADD COLUMN IF NOT EXISTS user_id BIGINT,
ADD COLUMN IF NOT EXISTS completed_sessions BOOLEAN DEFAULT FALSE;

-- If your MySQL version doesn't support IF NOT EXISTS for columns, use this instead:
-- ALTER TABLE timer_sessions ADD COLUMN user_id BIGINT;
-- ALTER TABLE timer_sessions ADD COLUMN completed_sessions BOOLEAN DEFAULT FALSE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_timer_sessions_user_id ON timer_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_timer_sessions_completed_sessions ON timer_sessions(completed_sessions);
CREATE INDEX IF NOT EXISTS idx_timer_sessions_completed_at ON timer_sessions(completed_at);

-- Verify the columns were added
DESCRIBE timer_sessions;
