-- Migration 149: Ensure resume_url exists on career_resumes
-- Fixes "Unknown column 'resume_url' in 'field list'" at runtime
-- UP
ALTER TABLE career_resumes
  ADD COLUMN IF NOT EXISTS resume_url VARCHAR(500) NULL AFTER version_name,
  ADD COLUMN IF NOT EXISTS resume_text LONGTEXT NULL AFTER resume_url;

-- DOWN
-- ALTER TABLE career_resumes DROP COLUMN resume_url, DROP COLUMN resume_text;
