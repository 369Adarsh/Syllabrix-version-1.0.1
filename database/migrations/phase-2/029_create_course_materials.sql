-- Migration 029: Create course_materials table
-- UP
CREATE TABLE course_materials (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    uploaded_by         INT UNSIGNED        NOT NULL,
    title               VARCHAR(200)        NOT NULL,
    description         TEXT                NULL,
    subject             VARCHAR(100)        NULL,
    material_type       ENUM('notes','question_paper','solution','textbook','presentation','worksheet','other') NOT NULL,
    file_url            VARCHAR(500)        NOT NULL,
    file_type           VARCHAR(20)         NULL,
    file_size_bytes     INT UNSIGNED        NULL,
    target_class        VARCHAR(50)         NULL,
    target_board        VARCHAR(50)         NULL,
    download_count      INT UNSIGNED        NOT NULL DEFAULT 0,
    is_active           TINYINT(1)          NOT NULL DEFAULT 1,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_cm_uploader (uploaded_by),
    INDEX idx_cm_subject (subject),
    INDEX idx_cm_type (material_type),
    CONSTRAINT fk_cm_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS course_materials;
