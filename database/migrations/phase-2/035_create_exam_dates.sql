-- Migration 035: Exam important dates (AI-updated)
-- UP
CREATE TABLE exam_dates (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    exam_id             INT UNSIGNED        NOT NULL,
    event_type          ENUM('registration_start','registration_end','admit_card','exam_date','result_date','cutoff_release','counselling','other') NOT NULL,
    event_name          VARCHAR(300)        NOT NULL,
    event_date          DATE                NULL,
    event_details       TEXT                NULL,
    is_tentative        TINYINT(1)          NOT NULL DEFAULT 0,
    source_url          VARCHAR(500)        NULL,
    ai_verified         TINYINT(1)          NOT NULL DEFAULT 0,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_ed_exam (exam_id),
    INDEX idx_ed_date (event_date),
    INDEX idx_ed_type (event_type),
    CONSTRAINT fk_ed_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS exam_dates;
