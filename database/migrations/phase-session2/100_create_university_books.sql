-- Migration 100: Create university_books table

CREATE TABLE IF NOT EXISTS university_books (
  id                     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  publisher_id           INT UNSIGNED NULL,
  university_subject_id  INT UNSIGNED NULL,
  title                  VARCHAR(500) NOT NULL,
  author                 VARCHAR(300),
  edition                VARCHAR(50),
  publication_year       YEAR,
  isbn                   VARCHAR(20),
  book_type              ENUM('textbook','reference','lab_manual',
                              'question_bank','notes') DEFAULT 'textbook',
  is_prescribed          TINYINT(1) DEFAULT 0,
  is_copyrighted         TINYINT(1) DEFAULT 1,
  is_available_free      TINYINT(1) DEFAULT 0,
  google_books_id        VARCHAR(100),
  open_library_id        VARCHAR(100),
  amazon_affiliate_url   VARCHAR(500),
  flipkart_affiliate_url VARCHAR(500),
  google_books_preview_url VARCHAR(300),
  cover_image_url        VARCHAR(300),
  priority_rank          TINYINT UNSIGNED DEFAULT 1,
  usage_tip              TEXT,
  is_active              TINYINT(1) DEFAULT 1,
  created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (publisher_id) REFERENCES publishers(id),
  FOREIGN KEY (university_subject_id) REFERENCES university_subjects(id)
);
