-- Migration 007: Create user_groups table
-- Study groups, project groups, etc.
-- MUST come before posts (posts references user_groups)
-- UP
CREATE TABLE user_groups (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    name                VARCHAR(150)        NOT NULL,
    description         TEXT                NULL,
    group_type          ENUM('study','project','class','general') NOT NULL DEFAULT 'general',
    photo_url           VARCHAR(500)        NULL,
    creator_id          INT UNSIGNED        NOT NULL,
    member_count        INT UNSIGNED        NOT NULL DEFAULT 1,
    max_members         INT UNSIGNED        NOT NULL DEFAULT 100,
    is_active           TINYINT(1)          NOT NULL DEFAULT 1,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_groups_creator (creator_id),
    INDEX idx_groups_type (group_type),
    CONSTRAINT fk_groups_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS user_groups;
