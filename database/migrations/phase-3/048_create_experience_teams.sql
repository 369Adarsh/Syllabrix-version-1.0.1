CREATE TABLE experience_teams (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    activity_id INT UNSIGNED NULL,
    profession_id INT UNSIGNED NOT NULL,
    creator_id INT UNSIGNED NOT NULL,
    member_count TINYINT UNSIGNED NOT NULL DEFAULT 1,
    max_members TINYINT UNSIGNED NOT NULL DEFAULT 5,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_et_profession (profession_id),
    CONSTRAINT fk_et_profession FOREIGN KEY (profession_id) REFERENCES professions(id) ON DELETE CASCADE,
    CONSTRAINT fk_et_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
