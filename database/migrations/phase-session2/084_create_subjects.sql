-- Migration 084: Create subjects table for AI Library feature
-- UP
CREATE TABLE IF NOT EXISTS subjects (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  class_id        INT UNSIGNED NOT NULL,
  name            VARCHAR(200) NOT NULL,
  code            VARCHAR(50)  NULL,
  subject_type    ENUM('core','elective','language','vocational') NOT NULL DEFAULT 'core',
  language_medium VARCHAR(50)  NOT NULL DEFAULT 'English',
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS subjects;
