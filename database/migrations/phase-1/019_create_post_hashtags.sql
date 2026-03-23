-- Migration 019: Create post_hashtags table
-- Links posts to hashtags (junction table)
-- UP
CREATE TABLE post_hashtags (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    post_id             INT UNSIGNED        NOT NULL,
    hashtag_id          INT UNSIGNED        NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_post_hashtag (post_id, hashtag_id),
    INDEX idx_ph_hashtag (hashtag_id),
    CONSTRAINT fk_ph_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_ph_hashtag FOREIGN KEY (hashtag_id) REFERENCES hashtags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS post_hashtags;
