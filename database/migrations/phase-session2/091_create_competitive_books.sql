-- Migration 091: Create competitive_books table for AI Library
-- UP
CREATE TABLE IF NOT EXISTS competitive_books (
  id                       INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  publisher_id             INT UNSIGNED  NOT NULL,
  competitive_subject_id   INT UNSIGNED  NULL,
  title                    VARCHAR(500)  NOT NULL,
  author                   VARCHAR(300)  NULL,
  edition                  VARCHAR(50)   NULL,
  publication_year         YEAR          NULL,
  is_copyrighted           TINYINT(1)    NOT NULL DEFAULT 1,
  is_available_free        TINYINT(1)    NOT NULL DEFAULT 0,
  google_books_id          VARCHAR(100)  NULL,
  open_library_id          VARCHAR(100)  NULL,
  amazon_affiliate_url     VARCHAR(500)  NULL,
  flipkart_affiliate_url   VARCHAR(500)  NULL,
  google_books_preview_url VARCHAR(300)  NULL,
  cover_image_url          VARCHAR(300)  NULL,
  priority_rank            TINYINT UNSIGNED NOT NULL DEFAULT 1,
  usage_tip                TEXT          NULL,
  is_active                TINYINT(1)    NOT NULL DEFAULT 1,
  created_at               TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (publisher_id)           REFERENCES publishers(id),
  FOREIGN KEY (competitive_subject_id) REFERENCES competitive_subjects(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS competitive_books;
