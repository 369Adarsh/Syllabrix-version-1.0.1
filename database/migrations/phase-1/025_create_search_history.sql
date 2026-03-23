-- Migration 025: Create search_history table
-- User search tracking (for recommendations)
-- UP
CREATE TABLE search_history (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    query               VARCHAR(255)        NOT NULL,
    result_type         ENUM('user','post','job','tuition','hashtag','category') NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_search_user (user_id, created_at),
    CONSTRAINT fk_search_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS search_history;
