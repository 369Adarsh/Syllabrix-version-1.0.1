-- Migration 033: Exam categories (hierarchical tree)
-- UP
CREATE TABLE exam_categories (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    name                VARCHAR(150)        NOT NULL,
    slug                VARCHAR(150)        NOT NULL,
    parent_id           INT UNSIGNED        NULL,
    level               TINYINT UNSIGNED    NOT NULL DEFAULT 0,
    icon_emoji          VARCHAR(10)         NULL,
    description         TEXT                NULL,
    is_active           TINYINT(1)          NOT NULL DEFAULT 1,
    display_order       INT UNSIGNED        NOT NULL DEFAULT 0,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_exam_cat_slug (slug),
    INDEX idx_exam_cat_parent (parent_id),
    INDEX idx_exam_cat_order (display_order),
    CONSTRAINT fk_exam_cat_parent FOREIGN KEY (parent_id) REFERENCES exam_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS exam_categories;
