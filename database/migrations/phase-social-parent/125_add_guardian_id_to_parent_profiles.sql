-- Add guardian_id to parent_profiles
-- Unique 10-digit ID starting with G- (e.g. G-1234567890)

ALTER TABLE parent_profiles 
ADD COLUMN guardian_id VARCHAR(15) UNIQUE NULL AFTER user_id;

-- Index for lookup
CREATE INDEX idx_guardian_id ON parent_profiles(guardian_id);
