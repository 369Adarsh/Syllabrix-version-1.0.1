-- Migration 032: Create teacher_ratings table
-- UP
CREATE TABLE teacher_ratings (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    teacher_user_id     INT UNSIGNED        NOT NULL,
    student_user_id     INT UNSIGNED        NOT NULL,
    rating              TINYINT UNSIGNED    NOT NULL,
    review              TEXT                NULL,
    class_id            INT UNSIGNED        NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_teacher_student_rating (teacher_user_id, student_user_id),
    INDEX idx_tr_teacher (teacher_user_id),
    CONSTRAINT fk_tr_teacher FOREIGN KEY (teacher_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tr_student FOREIGN KEY (student_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tr_class FOREIGN KEY (class_id) REFERENCES live_classes(id) ON DELETE SET NULL,
    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS teacher_ratings;
