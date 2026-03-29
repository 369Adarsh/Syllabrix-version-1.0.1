-- Migration 077: Add resume_url to student_profiles, teacher_profiles, professional_learner_profiles
-- UP
ALTER TABLE student_profiles
  ADD COLUMN resume_url VARCHAR(500) NULL AFTER updated_at;

ALTER TABLE teacher_profiles
  ADD COLUMN resume_url VARCHAR(500) NULL AFTER updated_at;

ALTER TABLE professional_learner_profiles
  ADD COLUMN resume_url VARCHAR(500) NULL AFTER updated_at;

-- DOWN
-- ALTER TABLE student_profiles DROP COLUMN resume_url;
-- ALTER TABLE teacher_profiles DROP COLUMN resume_url;
-- ALTER TABLE professional_learner_profiles DROP COLUMN resume_url;
