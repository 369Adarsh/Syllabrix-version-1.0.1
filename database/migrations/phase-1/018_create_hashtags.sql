-- Migration 018: Create hashtags table
-- Master hashtag list
-- UP
CREATE TABLE hashtags (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    tag                 VARCHAR(100)        NOT NULL,
    post_count          INT UNSIGNED        NOT NULL DEFAULT 0,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_hashtag_tag (tag),
    INDEX idx_hashtag_count (post_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS hashtags;
