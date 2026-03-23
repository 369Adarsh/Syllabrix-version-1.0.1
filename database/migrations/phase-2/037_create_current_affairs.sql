-- Migration 037: AI-generated current affairs
-- UP
CREATE TABLE current_affairs (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    date                DATE                NOT NULL,
    affair_type         ENUM('daily','weekly','monthly') NOT NULL DEFAULT 'daily',
    category            ENUM('national','international','economy','science_tech','sports','awards','appointments','environment','defence','legal','art_culture','other') NOT NULL,
    title               VARCHAR(500)        NOT NULL,
    content_points      JSON                NOT NULL,
    source_urls         JSON                NULL,
    mind_map_url        VARCHAR(500)        NULL,
    mind_map_data       JSON                NULL,
    quiz_questions      JSON                NULL,
    importance_level    ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
    relevant_exams      JSON                NULL,
    is_published        TINYINT(1)          NOT NULL DEFAULT 1,
    view_count          INT UNSIGNED        NOT NULL DEFAULT 0,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_ca_date (date),
    INDEX idx_ca_type (affair_type),
    INDEX idx_ca_category (category),
    INDEX idx_ca_importance (importance_level),
    INDEX idx_ca_published (is_published, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS current_affairs;
