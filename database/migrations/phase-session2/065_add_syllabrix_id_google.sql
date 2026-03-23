-- Migration 065: Add Syllabrix ID + Google OAuth columns
-- UP

ALTER TABLE users
  ADD COLUMN syllabrix_id VARCHAR(20) NULL AFTER id,
  ADD COLUMN google_id VARCHAR(100) NULL AFTER password_hash,
  ADD UNIQUE KEY uk_users_syllabrix_id (syllabrix_id),
  ADD INDEX idx_users_google_id (google_id);

-- DOWN
-- ALTER TABLE users DROP COLUMN syllabrix_id, DROP COLUMN google_id;
