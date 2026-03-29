-- Migration 089: Create exam_categories table for AI Library
-- UP
CREATE TABLE IF NOT EXISTS exam_categories (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code             VARCHAR(50)  NOT NULL UNIQUE,
  name             VARCHAR(200) NOT NULL,
  type             ENUM('school','engineering','medical','civil_services',
                        'banking','ssc','defence','state_psc','other') NOT NULL,
  level            ENUM('national','state') NOT NULL DEFAULT 'national',
  state            VARCHAR(100) NULL,
  conducting_body  VARCHAR(200) NULL,
  official_website VARCHAR(300) NULL,
  is_active        TINYINT(1)   NOT NULL DEFAULT 1,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS exam_categories;
