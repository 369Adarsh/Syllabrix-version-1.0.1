-- Migration 085: Create books table for AI Library feature
-- UP
CREATE TABLE IF NOT EXISTS books (
  id               INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  subject_id       INT UNSIGNED  NOT NULL,
  title            VARCHAR(500)  NOT NULL,
  publisher        VARCHAR(200)  NULL,
  edition          VARCHAR(100)  NULL,
  publication_year YEAR          NULL,
  is_official      TINYINT(1)    NOT NULL DEFAULT 0,
  open_library_id  VARCHAR(100)  NULL,
  google_books_id  VARCHAR(100)  NULL,
  ncert_url        VARCHAR(1000) NULL,
  cover_image_url  VARCHAR(1000) NULL,
  is_available_free TINYINT(1)   NOT NULL DEFAULT 0,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS books;
