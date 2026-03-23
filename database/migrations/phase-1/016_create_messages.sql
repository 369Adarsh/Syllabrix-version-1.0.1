-- Migration 016: Create messages table
-- Direct messages between users
-- UP
CREATE TABLE messages (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    sender_id           INT UNSIGNED        NOT NULL,
    receiver_id         INT UNSIGNED        NOT NULL,
    content             TEXT                NOT NULL,
    media_url           VARCHAR(500)        NULL,
    media_type          ENUM('none','image','video','document','voice') NOT NULL DEFAULT 'none',
    is_read             TINYINT(1)          NOT NULL DEFAULT 0,
    read_at             DATETIME            NULL,
    is_deleted_sender   TINYINT(1)          NOT NULL DEFAULT 0,
    is_deleted_receiver TINYINT(1)          NOT NULL DEFAULT 0,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_msg_sender (sender_id),
    INDEX idx_msg_receiver (receiver_id),
    INDEX idx_msg_conversation (sender_id, receiver_id, created_at),
    INDEX idx_msg_unread (receiver_id, is_read),
    CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS messages;
