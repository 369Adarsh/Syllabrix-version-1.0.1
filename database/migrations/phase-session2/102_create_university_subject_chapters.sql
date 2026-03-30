-- University Subject Chapters
-- Maps subjects to their chapters in a structured curriculum
CREATE TABLE IF NOT EXISTS university_subject_chapters (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  subject_id   INT UNSIGNED NOT NULL,
  chapter_num  TINYINT UNSIGNED NOT NULL,
  chapter_name VARCHAR(300) NOT NULL,
  description  TEXT,
  is_active    TINYINT(1) DEFAULT 1,
  FOREIGN KEY (subject_id) REFERENCES university_subjects(id) ON DELETE CASCADE,
  UNIQUE KEY uk_subject_chapter (subject_id, chapter_num)
);
