-- Migration 013: Create post_shares table
-- Shares/reposts tracking
-- UP
CREATE TABLE post_shares (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    post_id             INT UNSIGNED        NOT NULL,
    shared_post_id      INT UNSIGNED        NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_shares_user (user_id),
    INDEX idx_shares_post (post_id),
    CONSTRAINT fk_shares_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_shares_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS post_shares;
