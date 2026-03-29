-- Migration 090: Create competitive_subjects table for AI Library
-- UP
CREATE TABLE IF NOT EXISTS competitive_subjects (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  exam_category_id  INT UNSIGNED  NOT NULL,
  name              VARCHAR(200)  NOT NULL,
  parent_subject    VARCHAR(100)  NULL,
  sub_category      VARCHAR(100)  NULL,
  description       TEXT          NULL,
  syllabus_url      VARCHAR(300)  NULL,
  weightage_percent DECIMAL(5,2)  NULL,
  is_active         TINYINT(1)    NOT NULL DEFAULT 1,
  FOREIGN KEY (exam_category_id) REFERENCES exam_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS competitive_subjects;
