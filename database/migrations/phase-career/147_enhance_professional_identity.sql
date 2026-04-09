-- Add Professional ID to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS professional_id VARCHAR(20) DEFAULT NULL;

-- Add Work History to career_profiles
ALTER TABLE career_profiles ADD COLUMN IF NOT EXISTS work_history JSON DEFAULT NULL;
