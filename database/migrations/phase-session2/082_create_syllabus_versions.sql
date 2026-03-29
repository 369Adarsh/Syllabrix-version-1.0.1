-- Migration 082: Create syllabus_versions table for AI Library feature
-- UP
CREATE TABLE IF NOT EXISTS syllabus_versions (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  board_id             INT UNSIGNED NOT NULL,
  version_name         VARCHAR(100) NOT NULL,
  academic_year_start  YEAR         NOT NULL,
  academic_year_end    YEAR         NULL,
  is_current           TINYINT(1)   NOT NULL DEFAULT 0,
  changes_summary      TEXT         NULL,
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS syllabus_versions;
