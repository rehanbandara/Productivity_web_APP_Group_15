-- Add completed_sessions column to timer_sessions table
ALTER TABLE timer_sessions 
ADD COLUMN completed_sessions BOOLEAN DEFAULT FALSE;

-- Add index for better query performance
CREATE INDEX idx_timer_sessions_completed_sessions ON timer_sessions(completed_sessions);

-- Verify the column was added
DESCRIBE timer_sessions;

-- Test query to count completed sessions
SELECT COUNT(*) as completed_count 
FROM timer_sessions 
WHERE completed_sessions = TRUE;
