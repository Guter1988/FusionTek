-- Initial Database Schema for Feedback Analysis App
-- Support for Unicode is verified by ensuring the database is initialized with UTF8 encoding.

CREATE TABLE IF NOT EXISTS feedback_groups (
    id SERIAL PRIMARY KEY,
    label TEXT NOT NULL,
    canonical_key TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'RECEIVED',
    retry_count INT DEFAULT 0 NOT NULL,
    raw_ai_response TEXT,
    analysis_json JSONB,
    group_id INT REFERENCES feedback_groups(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT check_status CHECK (status IN ('RECEIVED', 'ANALYZING', 'DONE', 'FAILED'))
);

-- Index for performance on status checks and grouping
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_group_id ON feedback(group_id);

-- Automated trigger to handle updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feedback_updated_at
    BEFORE UPDATE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
