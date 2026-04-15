-- Migration 150: Add missing columns to career_profiles
-- Fixes "Unknown column 'resume_url' in 'field list'" in calibrateResume
-- UP
ALTER TABLE career_profiles
  ADD COLUMN IF NOT EXISTS resume_url      VARCHAR(500) NULL AFTER profile_strength,
  ADD COLUMN IF NOT EXISTS market_pulse    JSON         NULL AFTER resume_url,
  ADD COLUMN IF NOT EXISTS elite_employers JSON         NULL AFTER market_pulse;

-- DOWN
-- ALTER TABLE career_profiles
--   DROP COLUMN resume_url,
--   DROP COLUMN market_pulse,
--   DROP COLUMN elite_employers;
