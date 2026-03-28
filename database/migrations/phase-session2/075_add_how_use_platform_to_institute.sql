-- Migration 075: Add how_use_platform column to institute_profiles
-- UP
ALTER TABLE institute_profiles
  ADD COLUMN how_use_platform TEXT NULL AFTER parent_involvement_policy;

-- DOWN
-- ALTER TABLE institute_profiles DROP COLUMN how_use_platform;
