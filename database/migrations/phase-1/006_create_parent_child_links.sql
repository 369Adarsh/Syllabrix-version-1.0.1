-- Migration 006: Create parent_child_links table
-- Links parent/guardian accounts to child accounts
-- UP
CREATE TABLE parent_child_links (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    parent_user_id      INT UNSIGNED        NOT NULL,
    child_user_id       INT UNSIGNED        NOT NULL,
    status              ENUM('pending','active','revoked') NOT NULL DEFAULT 'pending',
    approved_at         DATETIME            NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_parent_child (parent_user_id, child_user_id),
    INDEX idx_pcl_child (child_user_id),
    CONSTRAINT fk_pcl_parent FOREIGN KEY (parent_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_pcl_child FOREIGN KEY (child_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS parent_child_links;
