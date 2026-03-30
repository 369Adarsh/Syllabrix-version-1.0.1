-- Migration 101: Create university_book_subject_links M2M table
-- One book can serve multiple subjects/courses

CREATE TABLE IF NOT EXISTS university_book_subject_links (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  university_book_id    INT UNSIGNED NOT NULL,
  university_subject_id INT UNSIGNED NOT NULL,
  relevance             ENUM('primary','reference','supplementary') DEFAULT 'primary',
  FOREIGN KEY (university_book_id) REFERENCES university_books(id),
  FOREIGN KEY (university_subject_id) REFERENCES university_subjects(id),
  UNIQUE KEY uq_uni_book_subject (university_book_id, university_subject_id)
);
