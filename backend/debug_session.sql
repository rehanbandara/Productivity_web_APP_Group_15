-- Check if timer_sessions table has completed_sessions column
DESCRIBE timer_sessions;

-- Check current sessions in database
SELECT * FROM timer_sessions ORDER BY created_at DESC LIMIT 5;

-- Test query for completed sessions count
SELECT COUNT(*) as completed_count 
FROM timer_sessions 
WHERE completed_sessions = TRUE;
