-- Migration 097: Create courses table

CREATE TABLE IF NOT EXISTS courses (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_category_id   INT UNSIGNED NOT NULL,
  name                 VARCHAR(200) NOT NULL,
  short_name           VARCHAR(50),
  level                ENUM('certificate','diploma','bachelor',
                            'master','doctorate','integrated') NOT NULL,
  duration_years       TINYINT UNSIGNED,
  specialization       VARCHAR(200),
  is_active            TINYINT(1) DEFAULT 1,
  FOREIGN KEY (course_category_id) REFERENCES course_categories(id)
);
