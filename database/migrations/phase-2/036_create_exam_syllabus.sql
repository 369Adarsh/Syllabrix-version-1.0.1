-- Migration 036: Exam syllabus (subject > topic > sub-topic tree)
-- UP
CREATE TABLE exam_syllabus (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    exam_id             INT UNSIGNED        NOT NULL,
    parent_id           INT UNSIGNED        NULL,
    level               ENUM('subject','topic','sub_topic') NOT NULL DEFAULT 'topic',
    title               VARCHAR(300)        NOT NULL,
    slug                VARCHAR(300)        NULL,
    description         TEXT                NULL,
    explanation_text    MEDIUMTEXT          NULL,
    weightage_percent   DECIMAL(5,2)        NULL,
    difficulty          ENUM('easy','medium','hard') NULL,
    recommended_books   JSON                NULL,
    mind_map_url        VARCHAR(500)        NULL,
    mind_map_data       JSON                NULL,
    key_points          JSON                NULL,
    display_order       INT UNSIGNED        NOT NULL DEFAULT 0,
    is_active           TINYINT(1)          NOT NULL DEFAULT 1,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_es_exam (exam_id),
    INDEX idx_es_parent (parent_id),
    INDEX idx_es_level (level),
    INDEX idx_es_order (display_order),
    CONSTRAINT fk_es_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    CONSTRAINT fk_es_parent FOREIGN KEY (parent_id) REFERENCES exam_syllabus(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS exam_syllabus;
