-- University Book Chapters (Table of Contents)
-- TOC entries for university books
CREATE TABLE IF NOT EXISTS university_book_chapters (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  book_id      INT UNSIGNED NOT NULL,
  chapter_num  TINYINT UNSIGNED NOT NULL,
  chapter_title VARCHAR(300) NOT NULL,
  page_start   SMALLINT UNSIGNED,
  page_end     SMALLINT UNSIGNED,
  is_active    TINYINT(1) DEFAULT 1,
  FOREIGN KEY (book_id) REFERENCES university_books(id) ON DELETE CASCADE,
  UNIQUE KEY uk_book_chapter (book_id, chapter_num)
);
