-- Migration 151: Career certifications pocket
-- Stores professional certifications users hold (AWS, Google, PMP, etc.)
-- UP
CREATE TABLE IF NOT EXISTS career_certifications (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id          INT UNSIGNED NOT NULL,
  title            VARCHAR(200) NOT NULL,
  issuer           VARCHAR(150) NOT NULL,
  issue_date       DATE         NULL,
  expiry_date      DATE         NULL,
  credential_id    VARCHAR(150) NULL,
  verification_url VARCHAR(500) NULL,
  badge_url        VARCHAR(500) NULL,
  is_featured      TINYINT(1)   NOT NULL DEFAULT 0,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- DOWN
-- DROP TABLE IF EXISTS career_certifications;
