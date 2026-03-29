-- Migration 092: Create book_exam_links join table for AI Library
-- Many-to-many: one competitive book can serve multiple exam categories
-- UP
CREATE TABLE IF NOT EXISTS book_exam_links (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  competitive_book_id INT UNSIGNED NOT NULL,
  exam_category_id    INT UNSIGNED NOT NULL,
  relevance           ENUM('primary','secondary','supplementary') NOT NULL DEFAULT 'primary',
  FOREIGN KEY (competitive_book_id) REFERENCES competitive_books(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_category_id)    REFERENCES exam_categories(id)   ON DELETE CASCADE,
  UNIQUE KEY unique_book_exam (competitive_book_id, exam_category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS book_exam_links;
