-- Migration 071: Create professional_learner_profiles table
-- UP
CREATE TABLE professional_learner_profiles (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    full_name           VARCHAR(150)        NOT NULL,
    current_company     VARCHAR(200)        NULL,
    designation         VARCHAR(150)        NULL,
    industry            VARCHAR(100)        NULL,
    experience_years    TINYINT UNSIGNED    NULL,
    education_level     ENUM('high_school','graduation','post_graduation','doctorate','other') NULL,
    skills              JSON                NULL,
    learning_goals      JSON                NULL,
    hobby               JSON                NULL,
    mandatory_courses   JSON                NULL,
    address_city        VARCHAR(100)        NULL,
    address_state       VARCHAR(100)        NULL,
    syllabrix_score     DECIMAL(5,2)        NOT NULL DEFAULT 0.00,
    experience_xp       INT UNSIGNED        NOT NULL DEFAULT 0,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_pl_user_id (user_id),
    INDEX idx_pl_industry (industry),
    INDEX idx_pl_score (syllabrix_score),
    CONSTRAINT fk_pl_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS professional_learner_profiles;
