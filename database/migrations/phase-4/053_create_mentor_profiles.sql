CREATE TABLE mentor_profiles (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    expertise JSON NULL,
    company VARCHAR(200) NULL,
    designation VARCHAR(200) NULL,
    linkedin_url VARCHAR(500) NULL,
    bio TEXT NULL,
    max_mentees TINYINT UNSIGNED NOT NULL DEFAULT 5,
    current_mentees TINYINT UNSIGNED NOT NULL DEFAULT 0,
    is_accepting TINYINT(1) NOT NULL DEFAULT 1,
    is_verified TINYINT(1) NOT NULL DEFAULT 0,
    total_sessions INT UNSIGNED NOT NULL DEFAULT 0,
    rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_mp_user (user_id),
    CONSTRAINT fk_mp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
