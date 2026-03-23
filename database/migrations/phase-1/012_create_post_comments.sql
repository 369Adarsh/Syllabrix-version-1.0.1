-- Migration 012: Create post_comments table
-- Comments on posts (positivity-checked before saving)
-- UP
CREATE TABLE post_comments (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    post_id             INT UNSIGNED        NOT NULL,
    parent_comment_id   INT UNSIGNED        NULL,
    content             TEXT                NOT NULL,
    positivity_score    DECIMAL(3,2)        NULL,
    is_active           TINYINT(1)          NOT NULL DEFAULT 1,
    is_flagged          TINYINT(1)          NOT NULL DEFAULT 0,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_comments_post (post_id),
    INDEX idx_comments_user (user_id),
    INDEX idx_comments_parent (parent_comment_id),
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_parent FOREIGN KEY (parent_comment_id) REFERENCES post_comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS post_comments;
