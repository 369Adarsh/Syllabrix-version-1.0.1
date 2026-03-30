-- Migration 096: Create course_categories table

CREATE TABLE IF NOT EXISTS course_categories (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  type      ENUM('technical','medical','science','commerce',
                 'arts','law','education','design',
                 'agriculture','management','other') NOT NULL,
  is_active TINYINT(1) DEFAULT 1
);
