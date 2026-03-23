-- Migration 020: Create jobs table
-- Job postings by institutes and teachers
-- UP
CREATE TABLE jobs (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    posted_by           INT UNSIGNED        NOT NULL,
    title               VARCHAR(200)        NOT NULL,
    description         TEXT                NOT NULL,
    institute_name      VARCHAR(200)        NULL,
    job_type            ENUM('full_time','part_time','freelance','contract','online_only') NOT NULL,
    subject             VARCHAR(100)        NULL,
    experience_required VARCHAR(50)         NULL,
    salary_min          DECIMAL(12,2)       NULL,
    salary_max          DECIMAL(12,2)       NULL,
    salary_currency     VARCHAR(3)          NOT NULL DEFAULT 'INR',
    salary_period       ENUM('hourly','monthly','yearly') NOT NULL DEFAULT 'monthly',
    location            VARCHAR(200)        NULL,
    is_remote           TINYINT(1)          NOT NULL DEFAULT 0,
    is_urgent           TINYINT(1)          NOT NULL DEFAULT 0,
    is_active           TINYINT(1)          NOT NULL DEFAULT 1,
    application_count   INT UNSIGNED        NOT NULL DEFAULT 0,
    expires_at          DATE                NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_jobs_posted_by (posted_by),
    INDEX idx_jobs_type (job_type),
    INDEX idx_jobs_subject (subject),
    INDEX idx_jobs_location (location),
    INDEX idx_jobs_active (is_active, created_at),
    CONSTRAINT fk_jobs_poster FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS jobs;
