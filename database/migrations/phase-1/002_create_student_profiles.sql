-- Migration 002: Create student_profiles table
-- Extended details for user_type = 'student'
-- UP
CREATE TABLE student_profiles (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    full_name           VARCHAR(150)        NOT NULL,
    age                 TINYINT UNSIGNED    NULL,
    school_name         VARCHAR(200)        NULL,
    class_name          VARCHAR(50)         NULL,
    board               ENUM('CBSE','ICSE','State Board','IB','IGCSE','Other') NULL,
    medium              ENUM('English','Hindi','Gujarati','Tamil','Telugu','Kannada','Malayalam','Marathi','Bengali','Other') NULL DEFAULT 'English',
    skills              JSON                NULL,
    interests           JSON                NULL,
    achievements_summary TEXT               NULL,
    syllabrix_score     DECIMAL(5,2)        NOT NULL DEFAULT 0.00,
    experience_xp       INT UNSIGNED        NOT NULL DEFAULT 0,
    guardian_user_id    INT UNSIGNED        NULL,
    requires_guardian   TINYINT(1)          NOT NULL DEFAULT 0,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_student_user_id (user_id),
    INDEX idx_student_school (school_name),
    INDEX idx_student_score (syllabrix_score),
    INDEX idx_student_guardian (guardian_user_id),
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_guardian FOREIGN KEY (guardian_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS student_profiles;
