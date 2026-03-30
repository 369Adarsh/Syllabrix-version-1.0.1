-- University Chapter Topics
-- Topics within each chapter
CREATE TABLE IF NOT EXISTS university_chapter_topics (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chapter_id   INT UNSIGNED NOT NULL,
  topic_num    TINYINT UNSIGNED NOT NULL,
  topic_name   VARCHAR(300) NOT NULL,
  description  TEXT,
  is_active    TINYINT(1) DEFAULT 1,
  FOREIGN KEY (chapter_id) REFERENCES university_subject_chapters(id) ON DELETE CASCADE,
  UNIQUE KEY uk_chapter_topic (chapter_id, topic_num)
);
