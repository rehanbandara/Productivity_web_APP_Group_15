-- Add completed_sessions and user_id columns to timer_sessions table
ALTER TABLE timer_sessions 
ADD COLUMN user_id BIGINT,
ADD COLUMN completed_sessions BOOLEAN DEFAULT FALSE;

-- Add index on user_id for better query performance
CREATE INDEX idx_timer_sessions_user_id ON timer_sessions(user_id);

-- Add index on completed_sessions for better query performance
CREATE INDEX idx_timer_sessions_completed_sessions ON timer_sessions(completed_sessions);

-- Add index on completed_at for ordering recent sessions
CREATE INDEX idx_timer_sessions_completed_at ON timer_sessions(completed_at);
