-- Migration 070: Extend parent_profiles with involvement and occupation fields
-- UP
ALTER TABLE parent_profiles
  ADD COLUMN occupation           VARCHAR(100)   NULL   AFTER full_name,
  ADD COLUMN hobby_involvement    TEXT           NULL   AFTER notification_email,
  ADD COLUMN sports_involvement   TEXT           NULL   AFTER hobby_involvement;

-- DOWN
-- ALTER TABLE parent_profiles
--   DROP COLUMN occupation, DROP COLUMN hobby_involvement, DROP COLUMN sports_involvement;
