-- Migration 010: Create posts table
-- All user-generated posts (text, photo, video, document)
-- UP
CREATE TABLE posts (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    content             TEXT                NULL,
    media_url           VARCHAR(500)        NULL,
    media_type          ENUM('none','image','video','document','multiple') NOT NULL DEFAULT 'none',
    media_urls          JSON                NULL,
    visibility          ENUM('public','followers','group','private') NOT NULL DEFAULT 'public',
    group_id            INT UNSIGNED        NULL,
    post_type           ENUM('regular','achievement','experience_share','repost','project_showcase') NOT NULL DEFAULT 'regular',
    original_post_id    INT UNSIGNED        NULL,
    hashtags            JSON                NULL,
    likes_count         INT UNSIGNED        NOT NULL DEFAULT 0,
    comments_count      INT UNSIGNED        NOT NULL DEFAULT 0,
    shares_count        INT UNSIGNED        NOT NULL DEFAULT 0,
    saves_count         INT UNSIGNED        NOT NULL DEFAULT 0,
    is_active           TINYINT(1)          NOT NULL DEFAULT 1,
    is_flagged          TINYINT(1)          NOT NULL DEFAULT 0,
    flag_reason         VARCHAR(255)        NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_posts_user (user_id),
    INDEX idx_posts_type (post_type),
    INDEX idx_posts_visibility (visibility),
    INDEX idx_posts_group (group_id),
    INDEX idx_posts_active (is_active),
    INDEX idx_posts_created (created_at),
    INDEX idx_posts_original (original_post_id),
    CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_posts_group FOREIGN KEY (group_id) REFERENCES user_groups(id) ON DELETE SET NULL,
    CONSTRAINT fk_posts_original FOREIGN KEY (original_post_id) REFERENCES posts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS posts;
