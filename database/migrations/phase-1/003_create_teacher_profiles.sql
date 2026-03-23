-- Migration 003: Create teacher_profiles table
-- Extended details for user_type = 'teacher'
-- UP
CREATE TABLE teacher_profiles (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    full_name           VARCHAR(150)        NOT NULL,
    subject_primary     VARCHAR(100)        NOT NULL,
    subjects_additional JSON                NULL,
    qualifications      JSON                NULL,
    teacher_type        ENUM('freelancer','institute_affiliated','both') NOT NULL DEFAULT 'freelancer',
    institute_name      VARCHAR(200)        NULL,
    institute_user_id   INT UNSIGNED        NULL,
    hourly_rate         DECIMAL(10,2)       NULL,
    currency            VARCHAR(3)          NOT NULL DEFAULT 'INR',
    experience_years    TINYINT UNSIGNED    NULL,
    rating              DECIMAL(3,2)        NOT NULL DEFAULT 0.00,
    total_ratings       INT UNSIGNED        NOT NULL DEFAULT 0,
    total_students      INT UNSIGNED        NOT NULL DEFAULT 0,
    total_classes       INT UNSIGNED        NOT NULL DEFAULT 0,
    verification_status ENUM('unverified','pending','verified','rejected') NOT NULL DEFAULT 'unverified',
    id_document_url     VARCHAR(500)        NULL,
    qualification_doc_url VARCHAR(500)      NULL,
    background_check_consent TINYINT(1)     NOT NULL DEFAULT 0,
    video_selfie_url    VARCHAR(500)        NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_teacher_user_id (user_id),
    INDEX idx_teacher_subject (subject_primary),
    INDEX idx_teacher_type (teacher_type),
    INDEX idx_teacher_rating (rating),
    INDEX idx_teacher_verification (verification_status),
    CONSTRAINT fk_teacher_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_teacher_institute FOREIGN KEY (institute_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS teacher_profiles;
