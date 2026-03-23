-- Migration 009: Create group_messages table
-- Messages within groups
-- UP
CREATE TABLE group_messages (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    group_id            INT UNSIGNED        NOT NULL,
    user_id             INT UNSIGNED        NOT NULL,
    content             TEXT                NOT NULL,
    media_url           VARCHAR(500)        NULL,
    media_type          ENUM('none','image','video','document','voice') NOT NULL DEFAULT 'none',
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_gmsg_group (group_id, created_at),
    INDEX idx_gmsg_user (user_id),
    CONSTRAINT fk_gmsg_group FOREIGN KEY (group_id) REFERENCES user_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_gmsg_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS group_messages;
