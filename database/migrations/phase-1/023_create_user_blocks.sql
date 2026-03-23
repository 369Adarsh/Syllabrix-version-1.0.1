-- Migration 023: Create user_blocks table
-- Blocked users
-- UP
CREATE TABLE user_blocks (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    blocker_id          INT UNSIGNED        NOT NULL,
    blocked_id          INT UNSIGNED        NOT NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_block (blocker_id, blocked_id),
    INDEX idx_blocks_blocked (blocked_id),
    CONSTRAINT fk_blocks_blocker FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_blocks_blocked FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS user_blocks;
