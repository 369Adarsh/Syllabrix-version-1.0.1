-- Migration 083: Create classes table for AI Library feature
-- UP
CREATE TABLE IF NOT EXISTS classes (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  board_id             INT UNSIGNED NOT NULL,
  syllabus_version_id  INT UNSIGNED NOT NULL,
  grade                TINYINT UNSIGNED NOT NULL,
  grade_label          VARCHAR(50)  NOT NULL,
  stream               ENUM('general','science','commerce','arts','NA') NOT NULL DEFAULT 'general',
  FOREIGN KEY (board_id)            REFERENCES boards(id)            ON DELETE CASCADE,
  FOREIGN KEY (syllabus_version_id) REFERENCES syllabus_versions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS classes;
