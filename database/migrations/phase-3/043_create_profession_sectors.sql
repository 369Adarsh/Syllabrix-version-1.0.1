CREATE TABLE profession_sectors (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    icon_emoji VARCHAR(10) NULL,
    description TEXT NULL,
    profession_count INT UNSIGNED NOT NULL DEFAULT 0,
    display_order INT UNSIGNED NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_ps_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
