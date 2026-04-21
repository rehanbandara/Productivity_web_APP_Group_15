-- Fix orphaned timer_sessions records
-- This script removes timer_sessions that reference non-existent users

-- First, identify orphaned records
SELECT ts.id, ts.user_id 
FROM timer_sessions ts 
LEFT JOIN users u ON ts.user_id = u.id 
WHERE u.id IS NULL;

-- Delete orphaned records
DELETE ts FROM timer_sessions ts 
LEFT JOIN users u ON ts.user_id = u.id 
WHERE u.id IS NULL;

-- Verify cleanup
SELECT COUNT(*) as remaining_timer_sessions FROM timer_sessions;
