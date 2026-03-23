-- Migration 004: Create institute_profiles table
-- Extended details for user_type = 'institute'
-- UP
CREATE TABLE institute_profiles (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    name                VARCHAR(200)        NOT NULL,
    institute_type      ENUM('school','college','university','coaching','online_academy','other') NOT NULL,
    established_year    YEAR                NULL,
    registration_number VARCHAR(100)        NULL,
    udise_code          VARCHAR(50)         NULL,
    website             VARCHAR(300)        NULL,
    address_line1       VARCHAR(300)        NULL,
    address_line2       VARCHAR(300)        NULL,
    city                VARCHAR(100)        NULL,
    state               VARCHAR(100)        NULL,
    pincode             VARCHAR(10)         NULL,
    student_count       INT UNSIGNED        NOT NULL DEFAULT 0,
    teacher_count       INT UNSIGNED        NOT NULL DEFAULT 0,
    rating              DECIMAL(3,2)        NOT NULL DEFAULT 0.00,
    total_ratings       INT UNSIGNED        NOT NULL DEFAULT 0,
    verification_status ENUM('unverified','pending','verified','rejected') NOT NULL DEFAULT 'unverified',
    authorized_person   VARCHAR(150)        NULL,
    authorized_person_id_url VARCHAR(500)   NULL,
    logo_url            VARCHAR(500)        NULL,
    about               TEXT                NULL,
    facilities          JSON                NULL,
    boards_offered      JSON                NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_institute_user_id (user_id),
    INDEX idx_institute_type (institute_type),
    INDEX idx_institute_city (city),
    INDEX idx_institute_rating (rating),
    INDEX idx_institute_verification (verification_status),
    CONSTRAINT fk_institute_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS institute_profiles;
