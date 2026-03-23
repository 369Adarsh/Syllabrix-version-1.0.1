-- Migration 021: Create job_applications table
-- Applications to jobs
-- UP
CREATE TABLE job_applications (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    job_id              INT UNSIGNED        NOT NULL,
    applicant_id        INT UNSIGNED        NOT NULL,
    cover_message       TEXT                NULL,
    resume_url          VARCHAR(500)        NULL,
    status              ENUM('applied','viewed','shortlisted','rejected','accepted') NOT NULL DEFAULT 'applied',
    status_updated_at   DATETIME            NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_job_applicant (job_id, applicant_id),
    INDEX idx_ja_applicant (applicant_id),
    INDEX idx_ja_status (status),
    CONSTRAINT fk_ja_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_ja_applicant FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS job_applications;
