-- Migration 022: Create tuition_ads table
-- Private tuition advertisements (by teachers or students)
-- UP
CREATE TABLE tuition_ads (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    ad_type             ENUM('offering_tuition','seeking_tutor') NOT NULL,
    title               VARCHAR(200)        NOT NULL,
    description         TEXT                NULL,
    subject             VARCHAR(100)        NOT NULL,
    class_range         VARCHAR(50)         NULL,
    location            VARCHAR(200)        NULL,
    is_online           TINYINT(1)          NOT NULL DEFAULT 0,
    budget_min          DECIMAL(10,2)       NULL,
    budget_max          DECIMAL(10,2)       NULL,
    budget_period       ENUM('hourly','monthly','per_session') NOT NULL DEFAULT 'monthly',
    is_active           TINYINT(1)          NOT NULL DEFAULT 1,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_tuition_user (user_id),
    INDEX idx_tuition_type (ad_type),
    INDEX idx_tuition_subject (subject),
    INDEX idx_tuition_active (is_active, created_at),
    CONSTRAINT fk_tuition_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS tuition_ads;
