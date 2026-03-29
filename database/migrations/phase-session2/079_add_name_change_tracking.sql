-- Migration 079: Add username and full_name change tracking to users
-- UP
ALTER TABLE users
  ADD COLUMN username_changed_at DATETIME NULL AFTER username,
  ADD COLUMN full_name_changed_at DATETIME NULL AFTER full_name;

-- DOWN
-- ALTER TABLE users
--   DROP COLUMN username_changed_at,
--   DROP COLUMN full_name_changed_at;
