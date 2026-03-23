-- Migration 026: Create user_sessions table
-- JWT token tracking for security
-- UP
CREATE TABLE user_sessions (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    token_hash          VARCHAR(255)        NOT NULL,
    device_info         VARCHAR(500)        NULL,
    ip_address          VARCHAR(45)         NULL,
    expires_at          DATETIME            NOT NULL,
    is_active           TINYINT(1)          NOT NULL DEFAULT 1,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_token (token_hash),
    INDEX idx_sessions_active (is_active, expires_at),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS user_sessions;
