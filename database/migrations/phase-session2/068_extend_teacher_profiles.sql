-- Migration 068: Extend teacher_profiles with new required fields
-- UP
ALTER TABLE teacher_profiles
  ADD COLUMN board_experience      JSON           NULL   AFTER subjects_additional,
  ADD COLUMN past_institutes       JSON           NULL   AFTER institute_name,
  ADD COLUMN has_own_business      TINYINT(1)     NOT NULL DEFAULT 0  AFTER past_institutes,
  ADD COLUMN business_name         VARCHAR(200)   NULL   AFTER has_own_business,
  ADD COLUMN hobby                 JSON           NULL   AFTER business_name,
  ADD COLUMN learning_interests    JSON           NULL   AFTER hobby,
  ADD COLUMN mandatory_courses     JSON           NULL   AFTER learning_interests;

-- DOWN
-- ALTER TABLE teacher_profiles
--   DROP COLUMN board_experience, DROP COLUMN past_institutes, DROP COLUMN has_own_business,
--   DROP COLUMN business_name, DROP COLUMN hobby, DROP COLUMN learning_interests,
--   DROP COLUMN mandatory_courses;
