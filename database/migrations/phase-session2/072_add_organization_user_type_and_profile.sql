-- Migration 072: Add organization user type + create organization_profiles table
-- UP
ALTER TABLE users
  MODIFY COLUMN user_type ENUM('student','teacher','institute','parent','mentor','professional_learner','organization') NOT NULL;

CREATE TABLE IF NOT EXISTS organization_profiles (
    id                    INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id               INT UNSIGNED        NOT NULL,
    admin_name            VARCHAR(150)        NOT NULL,
    official_company_name VARCHAR(200)        NOT NULL,
    brand_display_name    VARCHAR(200)        NULL,
    industry              VARCHAR(100)        NOT NULL,
    company_size          ENUM('1-50','51-200','201-500','501-2000','2001-10000','10000+') NULL,
    founded_year          YEAR                NULL,
    website               VARCHAR(300)        NULL,
    linkedin_url          VARCHAR(300)        NULL,
    logo_url              VARCHAR(500)        NULL,
    about                 TEXT                NULL,
    how_use_platform      TEXT                NULL,
    verification_status   ENUM('unverified','pending','verified','rejected') NOT NULL DEFAULT 'unverified',
    address_city          VARCHAR(100)        NULL,
    address_state         VARCHAR(100)        NULL,
    syllabrix_score       DECIMAL(5,2)        NOT NULL DEFAULT 0.00,
    created_at            DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_org_user_id (user_id),
    INDEX idx_org_industry (industry),
    CONSTRAINT fk_org_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- ALTER TABLE users MODIFY COLUMN user_type ENUM('student','teacher','institute','parent','mentor','professional_learner') NOT NULL;
-- DROP TABLE IF EXISTS organization_profiles;
