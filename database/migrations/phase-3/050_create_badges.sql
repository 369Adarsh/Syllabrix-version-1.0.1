CREATE TABLE badges (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    icon_emoji VARCHAR(10) NULL,
    icon_url VARCHAR(500) NULL,
    badge_type ENUM('experience','achievement','streak','milestone','special') NOT NULL DEFAULT 'experience',
    category VARCHAR(100) NULL,
    xp_required INT UNSIGNED NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_badge_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
