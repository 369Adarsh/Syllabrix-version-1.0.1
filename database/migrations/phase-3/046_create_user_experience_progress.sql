CREATE TABLE user_experience_progress (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    profession_id INT UNSIGNED NOT NULL,
    activities_completed INT UNSIGNED NOT NULL DEFAULT 0,
    total_xp INT UNSIGNED NOT NULL DEFAULT 0,
    stage ENUM('explorer','enthusiast','dedicated','mentee','champion') NOT NULL DEFAULT 'explorer',
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_uep (user_id, profession_id),
    INDEX idx_uep_user (user_id),
    INDEX idx_uep_stage (stage),
    CONSTRAINT fk_uep_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_uep_profession FOREIGN KEY (profession_id) REFERENCES professions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
