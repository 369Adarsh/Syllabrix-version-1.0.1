-- Migration 005: Create parent_profiles table
-- Extended details for user_type = 'parent'
-- UP
CREATE TABLE parent_profiles (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    full_name           VARCHAR(150)        NOT NULL,
    relationship        ENUM('mother','father','guardian','other') NOT NULL,
    phone_verified      TINYINT(1)          NOT NULL DEFAULT 0,
    id_document_url     VARCHAR(500)        NULL,
    notification_email  VARCHAR(255)        NULL,
    weekly_report_enabled TINYINT(1)        NOT NULL DEFAULT 1,
    screen_time_limit_minutes INT UNSIGNED  NULL,
    content_filter_level ENUM('strict','moderate','standard') NOT NULL DEFAULT 'strict',
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_parent_user_id (user_id),
    CONSTRAINT fk_parent_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS parent_profiles;
