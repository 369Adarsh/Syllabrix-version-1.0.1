-- Migration 028: Create live_class_attendees table
-- UP
CREATE TABLE live_class_attendees (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    class_id            INT UNSIGNED        NOT NULL,
    user_id             INT UNSIGNED        NOT NULL,
    joined_at           DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at             DATETIME            NULL,
    duration_seconds    INT UNSIGNED        NULL,
    PRIMARY KEY (id),
    INDEX idx_lca_class (class_id),
    INDEX idx_lca_user (user_id),
    CONSTRAINT fk_lca_class FOREIGN KEY (class_id) REFERENCES live_classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_lca_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS live_class_attendees;
