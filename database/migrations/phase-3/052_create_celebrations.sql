CREATE TABLE celebrations (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    celebration_type ENUM('first_post','first_like','badge_earned','streak','level_up','activity_complete','team_formed','mentorship','score_milestone') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    reference_id INT UNSIGNED NULL,
    reference_type VARCHAR(50) NULL,
    is_public TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_cel_user (user_id),
    INDEX idx_cel_type (celebration_type),
    CONSTRAINT fk_cel_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
