-- Initial Database Schema for Feedback Analysis App

-- Table: feedback
CREATE TABLE IF NOT EXISTS feedback (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    text TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    sentiment VARCHAR(50),
    feature_group VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraint for status validation
    CONSTRAINT check_status CHECK (status IN ('RECEIVED', 'ANALYZING', 'DONE', 'FAILED'))
);

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

-- Table: features
CREATE TABLE IF NOT EXISTS features (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    feedback_id INTEGER NOT NULL,
    feature VARCHAR(100) NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Foreign key to feedback table
    CONSTRAINT fk_features_feedback 
        FOREIGN KEY (feedback_id) 
        REFERENCES feedback(id) 
        ON DELETE CASCADE,
        
    -- Confidence must be between 0 and 1
    CONSTRAINT check_confidence 
        CHECK (confidence >= 0 AND confidence <= 1)
);

CREATE TRIGGER update_features_updated_at
    BEFORE UPDATE ON features
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Index for performance on foreign key lookups
CREATE INDEX IF NOT EXISTS idx_features_feedback_id ON features(feedback_id);
