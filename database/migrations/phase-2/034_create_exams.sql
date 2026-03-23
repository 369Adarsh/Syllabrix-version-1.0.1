-- Migration 034: Individual exams
-- UP
CREATE TABLE exams (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    category_id         INT UNSIGNED        NOT NULL,
    name                VARCHAR(200)        NOT NULL,
    slug                VARCHAR(200)        NOT NULL,
    full_name           VARCHAR(500)        NULL,
    conducting_body     VARCHAR(200)        NULL,
    description         TEXT                NULL,
    eligibility         TEXT                NULL,
    exam_pattern        JSON                NULL,
    frequency           ENUM('yearly','half_yearly','quarterly','monthly','as_notified') NOT NULL DEFAULT 'yearly',
    official_website    VARCHAR(500)        NULL,
    logo_url            VARCHAR(500)        NULL,
    is_active           TINYINT(1)          NOT NULL DEFAULT 1,
    subscriber_count    INT UNSIGNED        NOT NULL DEFAULT 0,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_exam_slug (slug),
    INDEX idx_exam_category (category_id),
    INDEX idx_exam_active (is_active),
    CONSTRAINT fk_exam_category FOREIGN KEY (category_id) REFERENCES exam_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS exams;
