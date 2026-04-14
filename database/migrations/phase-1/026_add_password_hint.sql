-- Migration 026: Add password_hint field
-- UP
ALTER TABLE users ADD COLUMN password_hint VARCHAR(255) NULL AFTER password_hash;

-- DOWN
-- ALTER TABLE users DROP COLUMN password_hint;
