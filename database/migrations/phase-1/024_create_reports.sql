-- Migration 024: Create reports table
-- Content and user reports
-- UP
CREATE TABLE reports (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    reporter_id         INT UNSIGNED        NOT NULL,
    reported_user_id    INT UNSIGNED        NULL,
    reported_post_id    INT UNSIGNED        NULL,
    reported_comment_id INT UNSIGNED        NULL,
    reported_message_id INT UNSIGNED        NULL,
    reason              ENUM('spam','harassment','inappropriate','hate_speech','bullying','self_harm','impersonation','misinformation','other') NOT NULL,
    description         TEXT                NULL,
    status              ENUM('pending','reviewed','action_taken','dismissed') NOT NULL DEFAULT 'pending',
    reviewer_note       TEXT                NULL,
    reviewed_at         DATETIME            NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_reports_reporter (reporter_id),
    INDEX idx_reports_status (status),
    INDEX idx_reports_user (reported_user_id),
    INDEX idx_reports_post (reported_post_id),
    CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reports_user FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_reports_post FOREIGN KEY (reported_post_id) REFERENCES posts(id) ON DELETE SET NULL,
    CONSTRAINT fk_reports_comment FOREIGN KEY (reported_comment_id) REFERENCES post_comments(id) ON DELETE SET NULL,
    CONSTRAINT fk_reports_message FOREIGN KEY (reported_message_id) REFERENCES messages(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS reports;
