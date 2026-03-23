CREATE TABLE activity_log (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NULL,
    entity_id INT UNSIGNED NULL,
    metadata JSON NULL,
    ip_address VARCHAR(45) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_al_user (user_id, created_at),
    INDEX idx_al_action (action_type),
    CONSTRAINT fk_al_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
