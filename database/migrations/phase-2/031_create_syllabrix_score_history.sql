-- Migration 031: Create syllabrix_score_history table
-- UP
CREATE TABLE syllabrix_score_history (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    score               DECIMAL(5,2)        NOT NULL,
    change_amount       DECIMAL(5,2)        NOT NULL DEFAULT 0.00,
    change_reason       VARCHAR(200)        NULL,
    recorded_at         DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_ssh_user (user_id, recorded_at),
    CONSTRAINT fk_ssh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS syllabrix_score_history;
