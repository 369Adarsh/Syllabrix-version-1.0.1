-- Migration 087: Create topics table for AI Library feature
-- UP
CREATE TABLE IF NOT EXISTS topics (
  id                          INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  chapter_id                  INT UNSIGNED     NOT NULL,
  title                       VARCHAR(300)     NOT NULL,
  topic_order                 TINYINT UNSIGNED NOT NULL DEFAULT 1,
  bloom_levels                JSON             NULL,
  weightage_percent           DECIMAL(5,2)     NULL,
  is_deleted_in_new_syllabus  TINYINT(1)       NOT NULL DEFAULT 0,
  is_new_in_current_syllabus  TINYINT(1)       NOT NULL DEFAULT 0,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS topics;
