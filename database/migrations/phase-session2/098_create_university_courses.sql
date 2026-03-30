-- Migration 098: Create university_courses join table
-- Maps which universities offer which courses

CREATE TABLE IF NOT EXISTS university_courses (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  university_id  INT UNSIGNED NOT NULL,
  course_id      INT UNSIGNED NOT NULL,
  intake         SMALLINT UNSIGNED,
  is_active      TINYINT(1) DEFAULT 1,
  FOREIGN KEY (university_id) REFERENCES universities(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  UNIQUE KEY uq_uni_course (university_id, course_id)
);
