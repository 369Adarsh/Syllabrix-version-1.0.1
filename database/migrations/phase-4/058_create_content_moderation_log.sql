CREATE TABLE content_moderation_log (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    content_type ENUM('post','comment','message','profile','group_message') NOT NULL,
    content_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    original_text TEXT NULL,
    action_taken ENUM('approved','flagged','removed','warning_sent','user_banned') NOT NULL,
    reason VARCHAR(300) NULL,
    flagged_words JSON NULL,
    moderator_id INT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_cml_user (user_id),
    INDEX idx_cml_type (content_type),
    INDEX idx_cml_action (action_taken),
    CONSTRAINT fk_cml_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
