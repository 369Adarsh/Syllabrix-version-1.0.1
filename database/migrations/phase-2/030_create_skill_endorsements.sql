-- Migration 030: Create skill_endorsements table
-- UP
CREATE TABLE skill_endorsements (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    student_user_id     INT UNSIGNED        NOT NULL,
    endorser_user_id    INT UNSIGNED        NOT NULL,
    skill_name          VARCHAR(100)        NOT NULL,
    endorsement_note    TEXT                NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_endorsement (student_user_id, endorser_user_id, skill_name),
    INDEX idx_endorse_student (student_user_id),
    INDEX idx_endorse_endorser (endorser_user_id),
    CONSTRAINT fk_endorse_student FOREIGN KEY (student_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_endorse_endorser FOREIGN KEY (endorser_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS skill_endorsements;
