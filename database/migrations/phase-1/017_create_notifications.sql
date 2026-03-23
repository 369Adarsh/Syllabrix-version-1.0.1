-- Migration 017: Create notifications table
-- All notification types
-- UP
CREATE TABLE notifications (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    type                ENUM('like','comment','follow','message','group_invite','job_alert','achievement','mention','live_class','mentorship','system') NOT NULL,
    actor_id            INT UNSIGNED        NULL,
    reference_id        INT UNSIGNED        NULL,
    reference_type      ENUM('post','comment','user','group','job','live_class','achievement','mentorship') NULL,
    message             VARCHAR(500)        NOT NULL,
    is_read             TINYINT(1)          NOT NULL DEFAULT 0,
    read_at             DATETIME            NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_notif_user (user_id, is_read, created_at),
    INDEX idx_notif_actor (actor_id),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notif_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS notifications;
