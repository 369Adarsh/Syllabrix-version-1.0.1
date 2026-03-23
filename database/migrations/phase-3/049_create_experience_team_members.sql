CREATE TABLE experience_team_members (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    team_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    role_title VARCHAR(100) NOT NULL DEFAULT 'Member',
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_etm (team_id, user_id),
    CONSTRAINT fk_etm_team FOREIGN KEY (team_id) REFERENCES experience_teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_etm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
