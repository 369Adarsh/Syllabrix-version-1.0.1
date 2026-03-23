-- Migration 008: Create group_members table
-- Membership in groups
-- UP
CREATE TABLE group_members (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    group_id            INT UNSIGNED        NOT NULL,
    user_id             INT UNSIGNED        NOT NULL,
    role                ENUM('admin','moderator','member') NOT NULL DEFAULT 'member',
    joined_at           DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_group_member (group_id, user_id),
    INDEX idx_gm_user (user_id),
    CONSTRAINT fk_gm_group FOREIGN KEY (group_id) REFERENCES user_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_gm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS group_members;
