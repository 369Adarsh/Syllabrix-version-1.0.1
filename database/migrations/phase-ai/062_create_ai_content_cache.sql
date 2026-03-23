-- -----------------------------------------------
-- TABLE: ai_content_cache
-- Caches AI-generated content (career guidance, exam details, profession explore)
-- Avoids regenerating same content repeatedly
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS ai_content_cache (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    cache_key           VARCHAR(300)        NOT NULL,
    content_type        ENUM('career_guidance','stream_compare','exam_details','profession_explore','profession_challenge','profession_ethics','profession_comms') NOT NULL,
    content_json        JSON                NOT NULL,
    ai_provider         VARCHAR(30)         NULL,
    generated_at        DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at          DATETIME            NOT NULL,
    access_count        INT UNSIGNED        NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uk_acc_key (cache_key(255)),
    INDEX idx_acc_type (content_type),
    INDEX idx_acc_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- TABLE: ai_daily_digest
-- Daily auto-generated content (current affairs, quizzes)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS ai_daily_digest (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    digest_date         DATE                NOT NULL,
    digest_type         ENUM('current_affairs','daily_quiz','news_summary','monthly_compilation') NOT NULL,
    category            VARCHAR(100)        NULL,
    title               VARCHAR(300)        NULL,
    content_json        JSON                NOT NULL,
    source_urls         JSON                NULL,
    ai_provider         VARCHAR(30)         NULL,
    is_published        TINYINT(1)          NOT NULL DEFAULT 1,
    generated_at        DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_add_date_type (digest_date, digest_type, category(50)),
    INDEX idx_add_date (digest_date DESC),
    INDEX idx_add_type (digest_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
