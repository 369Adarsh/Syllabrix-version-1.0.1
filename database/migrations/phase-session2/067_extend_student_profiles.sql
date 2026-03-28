-- Migration 067: Extend student_profiles with new required fields
-- UP
ALTER TABLE student_profiles
  ADD COLUMN education_level       ENUM('school','college','coaching','specialization') NOT NULL DEFAULT 'school'       AFTER medium,
  ADD COLUMN subject_stream        VARCHAR(100)   NULL                                                                  AFTER education_level,
  ADD COLUMN college_name          VARCHAR(200)   NULL                                                                  AFTER subject_stream,
  ADD COLUMN university            VARCHAR(200)   NULL                                                                  AFTER college_name,
  ADD COLUMN address_line1         VARCHAR(300)   NULL                                                                  AFTER university,
  ADD COLUMN address_city          VARCHAR(100)   NULL                                                                  AFTER address_line1,
  ADD COLUMN address_state         VARCHAR(100)   NULL                                                                  AFTER address_city,
  ADD COLUMN address_pincode       VARCHAR(10)    NULL                                                                  AFTER address_state,
  ADD COLUMN ambition              TEXT           NULL                                                                  AFTER address_pincode,
  ADD COLUMN hobby                 JSON           NULL                                                                  AFTER ambition,
  ADD COLUMN favorite_subject      VARCHAR(150)   NULL                                                                  AFTER hobby,
  ADD COLUMN difficult_subject     VARCHAR(150)   NULL                                                                  AFTER favorite_subject,
  ADD COLUMN loved_professions     JSON           NULL                                                                  AFTER difficult_subject,
  ADD COLUMN future_vision         TEXT           NULL                                                                  AFTER loved_professions,
  ADD COLUMN sports                JSON           NULL                                                                  AFTER future_vision,
  ADD COLUMN sports_level          ENUM('beginner','intermediate','advanced','competitive') NULL                        AFTER sports,
  ADD COLUMN exam_type             VARCHAR(100)   NULL                                                                  AFTER sports_level,
  ADD COLUMN exam_target_year      YEAR           NULL                                                                  AFTER exam_type,
  ADD COLUMN specialization_courses JSON          NULL                                                                  AFTER exam_target_year,
  ADD COLUMN mandatory_courses     JSON           NULL                                                                  AFTER specialization_courses;

-- DOWN
-- ALTER TABLE student_profiles
--   DROP COLUMN education_level, DROP COLUMN subject_stream, DROP COLUMN college_name,
--   DROP COLUMN university, DROP COLUMN address_line1, DROP COLUMN address_city,
--   DROP COLUMN address_state, DROP COLUMN address_pincode, DROP COLUMN ambition,
--   DROP COLUMN hobby, DROP COLUMN favorite_subject, DROP COLUMN difficult_subject,
--   DROP COLUMN loved_professions, DROP COLUMN future_vision, DROP COLUMN sports,
--   DROP COLUMN sports_level, DROP COLUMN exam_type, DROP COLUMN exam_target_year,
--   DROP COLUMN specialization_courses, DROP COLUMN mandatory_courses;
