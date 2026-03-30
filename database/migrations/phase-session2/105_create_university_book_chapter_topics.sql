-- University Book Chapter Topics
-- Topics within each book chapter (granular TOC)
CREATE TABLE IF NOT EXISTS university_book_chapter_topics (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  book_chapter_id INT UNSIGNED NOT NULL,
  topic_name      VARCHAR(300) NOT NULL,
  page_num        SMALLINT UNSIGNED,
  FOREIGN KEY (book_chapter_id) REFERENCES university_book_chapters(id) ON DELETE CASCADE
);
