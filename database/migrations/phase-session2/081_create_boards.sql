-- Migration 081: Create boards table for AI Library feature
-- UP
CREATE TABLE IF NOT EXISTS boards (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(20)  NOT NULL UNIQUE,
  name        VARCHAR(200) NOT NULL,
  type        ENUM('national','state','international') NOT NULL DEFAULT 'national',
  state       VARCHAR(100) NULL,
  country     VARCHAR(100) NOT NULL DEFAULT 'India',
  official_website VARCHAR(500) NULL,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS boards;
