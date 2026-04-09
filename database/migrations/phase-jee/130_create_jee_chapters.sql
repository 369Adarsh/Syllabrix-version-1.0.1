CREATE TABLE IF NOT EXISTS jee_chapters (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  subject_id INT UNSIGNED NOT NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  class_level TINYINT NOT NULL,
  chapter_number TINYINT NOT NULL,
  jee_main_weightage DECIMAL(4,1) DEFAULT 0,
  jee_advanced_weightage DECIMAL(4,1) DEFAULT 0,
  total_topics INT UNSIGNED DEFAULT 0,
  description TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES jee_subjects(id) ON DELETE CASCADE,
  UNIQUE KEY uk_chapter (subject_id, slug, class_level),
  INDEX idx_subject_class (subject_id, class_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
