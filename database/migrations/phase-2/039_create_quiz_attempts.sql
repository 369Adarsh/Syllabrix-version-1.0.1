-- Migration 039: User quiz attempts
-- UP
CREATE TABLE quiz_attempts (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    quiz_id             INT UNSIGNED        NOT NULL,
    answers             JSON                NOT NULL,
    score               SMALLINT UNSIGNED   NOT NULL DEFAULT 0,
    total_questions     SMALLINT UNSIGNED   NOT NULL,
    correct_count       SMALLINT UNSIGNED   NOT NULL DEFAULT 0,
    wrong_count         SMALLINT UNSIGNED   NOT NULL DEFAULT 0,
    skipped_count       SMALLINT UNSIGNED   NOT NULL DEFAULT 0,
    time_taken_seconds  INT UNSIGNED        NULL,
    completed_at        DATETIME            NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_qa_user (user_id),
    INDEX idx_qa_quiz (quiz_id),
    INDEX idx_qa_score (score DESC),
    INDEX idx_qa_completed (completed_at),
    CONSTRAINT fk_qa_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_qa_quiz FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS quiz_attempts;
