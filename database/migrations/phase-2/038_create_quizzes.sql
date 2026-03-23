-- Migration 038: Quizzes (daily, topic, mock)
-- UP
CREATE TABLE quizzes (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    title               VARCHAR(300)        NOT NULL,
    exam_id             INT UNSIGNED        NULL,
    subject             VARCHAR(100)        NULL,
    topic               VARCHAR(200)        NULL,
    quiz_type           ENUM('daily_current_affairs','topic_practice','mock_test','weekly_challenge','prep_battle') NOT NULL,
    questions           JSON                NOT NULL,
    total_questions     SMALLINT UNSIGNED   NOT NULL,
    time_limit_seconds  INT UNSIGNED        NULL,
    difficulty          ENUM('easy','medium','hard','mixed') NOT NULL DEFAULT 'mixed',
    is_daily            TINYINT(1)          NOT NULL DEFAULT 0,
    date_for            DATE                NULL,
    total_attempts      INT UNSIGNED        NOT NULL DEFAULT 0,
    avg_score_percent   DECIMAL(5,2)        NOT NULL DEFAULT 0.00,
    is_published        TINYINT(1)          NOT NULL DEFAULT 1,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_quiz_exam (exam_id),
    INDEX idx_quiz_type (quiz_type),
    INDEX idx_quiz_daily (is_daily, date_for),
    INDEX idx_quiz_published (is_published),
    CONSTRAINT fk_quiz_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS quizzes;
