CREATE TABLE user_badges (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    badge_id INT UNSIGNED NOT NULL,
    earned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_ub (user_id, badge_id),
    INDEX idx_ub_user (user_id),
    CONSTRAINT fk_ub_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ub_badge FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
