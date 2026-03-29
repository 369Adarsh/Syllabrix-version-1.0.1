-- Migration 078: Add linkedin_url to professional_learner_profiles
-- UP
ALTER TABLE professional_learner_profiles
  ADD COLUMN linkedin_url VARCHAR(500) NULL AFTER resume_url;

-- DOWN
-- ALTER TABLE professional_learner_profiles DROP COLUMN linkedin_url;
