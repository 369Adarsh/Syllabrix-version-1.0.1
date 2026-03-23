-- Migration 040: Exams user is preparing for
-- UP
CREATE TABLE user_exam_selections (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    exam_id             INT UNSIGNED        NOT NULL,
    target_year         YEAR                NULL,
    is_active           TINYINT(1)          NOT NULL DEFAULT 1,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_exam (user_id, exam_id),
    INDEX idx_ues_user (user_id),
    INDEX idx_ues_exam (exam_id),
    CONSTRAINT fk_ues_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ues_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS user_exam_selections;
