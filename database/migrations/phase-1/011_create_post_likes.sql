-- Migration 011: Create post_likes table
-- Positivity-only reactions
-- UP
CREATE TABLE post_likes (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    post_id             INT UNSIGNED        NOT NULL,
    reaction_type       ENUM('like','amazing','keep_going','congratulations','smart','well_done','love','rocket','learning') NOT NULL DEFAULT 'like',
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_like_user_post (user_id, post_id),
    INDEX idx_likes_post (post_id),
    CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_likes_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS post_likes;
