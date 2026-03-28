-- Migration 074: Create become_mentor_requests table (existing users applying to be mentors)
-- UP
CREATE TABLE IF NOT EXISTS become_mentor_requests (
    id                    INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id               INT UNSIGNED        NOT NULL,
    specialization_field  VARCHAR(150)        NOT NULL,
    current_expertise     JSON                NULL,
    motivation            TEXT                NOT NULL,
    years_experience      TINYINT UNSIGNED    NULL,
    highest_qualification VARCHAR(150)        NULL,
    linkedin_url          VARCHAR(300)        NULL,
    status                ENUM('pending','under_review','approved','rejected') NOT NULL DEFAULT 'pending',
    admin_note            TEXT                NULL,
    applied_at            DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_bmr_user (user_id),
    INDEX idx_bmr_status (status),
    CONSTRAINT fk_bmr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS become_mentor_requests;
