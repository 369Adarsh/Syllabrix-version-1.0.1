-- Migration 129: Add hr_professional user type and create hr_professional_profiles table
-- UP
ALTER TABLE users
  MODIFY COLUMN user_type ENUM('student','teacher','institute','parent','mentor','professional_learner','organization','hr_professional') NOT NULL;

CREATE TABLE IF NOT EXISTS hr_professional_profiles (
    id                    INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id               INT UNSIGNED        NOT NULL,
    company_name          VARCHAR(200)        NOT NULL,
    hr_role               VARCHAR(150)        NOT NULL DEFAULT 'HR Professional',
    industry              VARCHAR(100)        NULL,
    experience_years      TINYINT UNSIGNED    NULL,
    location              VARCHAR(200)        NULL,
    linkedin_url          VARCHAR(300)        NULL,
    about                 TEXT                NULL,
    skills                JSON                NULL,
    verification_status   ENUM('unverified','pending','verified','rejected') NOT NULL DEFAULT 'unverified',
    syllabrix_score       DECIMAL(5,2)        NOT NULL DEFAULT 0.00,
    created_at            DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_hr_user_id (user_id),
    INDEX idx_hr_company (company_name),
    CONSTRAINT fk_hr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- ALTER TABLE users MODIFY COLUMN user_type ENUM('student','teacher','institute','parent','mentor','professional_learner','organization') NOT NULL;
-- DROP TABLE IF EXISTS hr_professional_profiles;
