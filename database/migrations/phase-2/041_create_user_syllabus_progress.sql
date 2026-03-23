-- Migration 041: Topic completion tracking
-- UP
CREATE TABLE user_syllabus_progress (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    syllabus_id         INT UNSIGNED        NOT NULL,
    status              ENUM('not_started','in_progress','completed','revision') NOT NULL DEFAULT 'not_started',
    notes               TEXT                NULL,
    completed_at        DATETIME            NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_syllabus (user_id, syllabus_id),
    INDEX idx_usp_user (user_id),
    INDEX idx_usp_status (status),
    CONSTRAINT fk_usp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_usp_syllabus FOREIGN KEY (syllabus_id) REFERENCES exam_syllabus(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS user_syllabus_progress;
