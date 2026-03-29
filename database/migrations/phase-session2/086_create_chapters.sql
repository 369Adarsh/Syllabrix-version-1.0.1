-- Migration 086: Create chapters table for AI Library feature
-- UP
CREATE TABLE IF NOT EXISTS chapters (
  id                        INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  book_id                   INT UNSIGNED   NOT NULL,
  chapter_number            TINYINT UNSIGNED NOT NULL,
  title                     VARCHAR(300)   NOT NULL,
  description               TEXT           NULL,
  key_concepts              JSON           NULL,
  learning_outcomes         JSON           NULL,
  estimated_study_time_mins SMALLINT UNSIGNED NULL,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS chapters;
