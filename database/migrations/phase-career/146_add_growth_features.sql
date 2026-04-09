-- ============================================================
-- Add Growth Features to Career Profile
-- ============================================================
ALTER TABLE career_profiles
ADD COLUMN mentorship_preference ENUM('expert', 'peer', 'ai') DEFAULT 'ai' AFTER salary_expectation,
ADD COLUMN focus_priority JSON AFTER mentorship_preference;
