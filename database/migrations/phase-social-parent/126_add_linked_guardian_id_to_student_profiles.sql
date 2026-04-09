-- Add linked_guardian_id to student_profiles
-- Stores G-ID of the parent to link student account.

ALTER TABLE student_profiles
ADD COLUMN linked_guardian_id VARCHAR(15) NULL AFTER user_id;

-- Index for searching
CREATE INDEX idx_linked_guardian_id ON student_profiles(linked_guardian_id);
