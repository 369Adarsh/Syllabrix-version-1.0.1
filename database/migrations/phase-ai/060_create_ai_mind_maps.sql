-- -----------------------------------------------
-- TABLE: ai_mind_maps
-- Stores generated mind maps for reuse and caching
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS ai_mind_maps (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NULL,
    topic               VARCHAR(300)        NOT NULL,
    class_level         VARCHAR(30)         NULL,
    board               VARCHAR(30)         NULL,
    goal                ENUM('understand','exam','revision','project') NULL DEFAULT 'understand',
    tree_json           JSON                NOT NULL,
    notes_json          JSON                NULL,
    ai_provider         VARCHAR(30)         NULL,
    generated_at        DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    access_count        INT UNSIGNED        NOT NULL DEFAULT 1,
    last_accessed_at    DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_mm_topic (topic(100)),
    INDEX idx_mm_user (user_id),
    INDEX idx_mm_class (class_level, board),
    CONSTRAINT fk_mm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
