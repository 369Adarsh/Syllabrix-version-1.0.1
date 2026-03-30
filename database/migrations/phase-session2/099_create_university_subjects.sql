-- Migration 099: Create university_subjects table
-- Semester-wise subjects for each course; university_id NULL = common across universities

CREATE TABLE IF NOT EXISTS university_subjects (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id             INT UNSIGNED NOT NULL,
  university_id         INT UNSIGNED NULL,
  name                  VARCHAR(200) NOT NULL,
  subject_code          VARCHAR(50),
  semester              TINYINT UNSIGNED,
  year                  TINYINT UNSIGNED,
  subject_type          ENUM('core','elective','lab','project',
                             'internship','audit') DEFAULT 'core',
  credits               TINYINT UNSIGNED,
  is_common_across_uni  TINYINT(1) DEFAULT 0,
  syllabus_body         VARCHAR(100),
  is_active             TINYINT(1) DEFAULT 1,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (university_id) REFERENCES universities(id)
);
