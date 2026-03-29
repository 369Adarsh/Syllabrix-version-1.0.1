-- Migration 093: Extend existing school books table with competitive-context fields
-- UP
ALTER TABLE books
  ADD COLUMN publisher_id              INT UNSIGNED NULL AFTER is_available_free,
  ADD COLUMN exam_category_id          INT UNSIGNED NULL AFTER publisher_id,
  ADD COLUMN priority_rank             TINYINT UNSIGNED NOT NULL DEFAULT 1 AFTER exam_category_id,
  ADD COLUMN affiliate_link            VARCHAR(500)     NULL AFTER priority_rank,
  ADD COLUMN google_books_preview_url  VARCHAR(300)     NULL AFTER affiliate_link,
  ADD FOREIGN KEY fk_books_publisher  (publisher_id)     REFERENCES publishers(id),
  ADD FOREIGN KEY fk_books_exam       (exam_category_id) REFERENCES exam_categories(id);

-- DOWN
-- ALTER TABLE books
--   DROP FOREIGN KEY fk_books_publisher,
--   DROP FOREIGN KEY fk_books_exam,
--   DROP COLUMN publisher_id,
--   DROP COLUMN exam_category_id,
--   DROP COLUMN priority_rank,
--   DROP COLUMN affiliate_link,
--   DROP COLUMN google_books_preview_url;
