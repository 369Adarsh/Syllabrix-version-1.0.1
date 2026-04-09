CREATE TABLE IF NOT EXISTS jee_topics (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chapter_id INT UNSIGNED NOT NULL,
  name VARCHAR(300) NOT NULL,
  slug VARCHAR(300) NOT NULL,
  display_order TINYINT NOT NULL DEFAULT 1,
  difficulty ENUM('easy','medium','hard') DEFAULT 'medium',
  theory_content LONGTEXT,
  key_formulas JSON,
  key_concepts JSON,
  common_mistakes JSON,
  solved_examples JSON,
  jee_tips TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chapter_id) REFERENCES jee_chapters(id) ON DELETE CASCADE,
  INDEX idx_chapter (chapter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
