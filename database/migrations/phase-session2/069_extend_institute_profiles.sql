-- Migration 069: Extend institute_profiles with platform handler and chain details
-- UP
ALTER TABLE institute_profiles
  ADD COLUMN platform_handler_name  VARCHAR(150)  NULL   AFTER authorized_person,
  ADD COLUMN platform_handler_phone VARCHAR(20)   NULL   AFTER platform_handler_name,
  ADD COLUMN platform_handler_email VARCHAR(255)  NULL   AFTER platform_handler_phone,
  ADD COLUMN chain_schools          JSON          NULL   AFTER platform_handler_email,
  ADD COLUMN parent_involvement_policy TEXT        NULL   AFTER chain_schools;

-- DOWN
-- ALTER TABLE institute_profiles
--   DROP COLUMN platform_handler_name, DROP COLUMN platform_handler_phone,
--   DROP COLUMN platform_handler_email, DROP COLUMN chain_schools,
--   DROP COLUMN parent_involvement_policy;
