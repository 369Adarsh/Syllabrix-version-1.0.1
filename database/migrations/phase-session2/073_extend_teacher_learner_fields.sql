-- Migration 073: Add self-as-learner fields to teacher_profiles + extend professional_learner_profiles
-- UP
ALTER TABLE teacher_profiles
  ADD COLUMN self_as_learner     TEXT NULL AFTER mandatory_courses,
  ADD COLUMN platform_as_student TEXT NULL AFTER self_as_learner,
  ADD COLUMN platform_as_teacher TEXT NULL AFTER platform_as_student;

ALTER TABLE professional_learner_profiles
  ADD COLUMN previous_companies  JSON     NULL  AFTER current_company,
  ADD COLUMN looking_for_job     TINYINT(1) NOT NULL DEFAULT 0 AFTER learning_goals,
  ADD COLUMN how_use_platform    TEXT     NULL  AFTER looking_for_job;

-- DOWN
-- ALTER TABLE teacher_profiles DROP COLUMN self_as_learner, DROP COLUMN platform_as_student, DROP COLUMN platform_as_teacher;
-- ALTER TABLE professional_learner_profiles DROP COLUMN previous_companies, DROP COLUMN looking_for_job, DROP COLUMN how_use_platform;
