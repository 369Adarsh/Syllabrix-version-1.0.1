-- Migration 088: Create publishers table for AI Library
-- UP
CREATE TABLE IF NOT EXISTS publishers (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name                VARCHAR(200) NOT NULL,
  short_name          VARCHAR(50)  NULL,
  focus_area          VARCHAR(300) NULL,
  website             VARCHAR(300) NULL,
  amazon_search_url   VARCHAR(500) NULL,
  flipkart_search_url VARCHAR(500) NULL,
  partnership_status  ENUM('none','contacted','licensed') NOT NULL DEFAULT 'none',
  is_active           TINYINT(1)   NOT NULL DEFAULT 1,
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS publishers;
