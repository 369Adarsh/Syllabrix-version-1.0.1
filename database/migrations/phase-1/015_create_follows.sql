-- Migration 015: Create follows table
-- User follow relationships
-- UP
CREATE TABLE follows (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    follower_id         INT UNSIGNED        NOT NULL,
    following_id        INT UNSIGNED        NOT NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_follow (follower_id, following_id),
    INDEX idx_follows_following (following_id),
    CONSTRAINT fk_follows_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_follows_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS follows;
