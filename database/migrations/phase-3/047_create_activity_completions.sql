CREATE TABLE activity_completions (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    activity_id INT UNSIGNED NOT NULL,
    submission_text TEXT NULL,
    submission_url VARCHAR(500) NULL,
    xp_earned INT UNSIGNED NOT NULL DEFAULT 0,
    ai_feedback TEXT NULL,
    score DECIMAL(5,2) NULL,
    completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_ac (user_id, activity_id),
    INDEX idx_ac_user (user_id),
    CONSTRAINT fk_ac_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ac_activity FOREIGN KEY (activity_id) REFERENCES experience_activities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
