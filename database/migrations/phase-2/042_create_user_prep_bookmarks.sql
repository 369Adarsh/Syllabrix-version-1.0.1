-- Migration 042: Saved prep content
-- UP
CREATE TABLE user_prep_bookmarks (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    content_type        ENUM('current_affair','quiz','syllabus_topic','mind_map','exam') NOT NULL,
    content_id          INT UNSIGNED        NOT NULL,
    folder_name         VARCHAR(100)        NULL DEFAULT 'General',
    notes               TEXT                NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_bookmark (user_id, content_type, content_id),
    INDEX idx_upb_user (user_id),
    INDEX idx_upb_type (content_type),
    INDEX idx_upb_folder (user_id, folder_name),
    CONSTRAINT fk_upb_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS user_prep_bookmarks;
