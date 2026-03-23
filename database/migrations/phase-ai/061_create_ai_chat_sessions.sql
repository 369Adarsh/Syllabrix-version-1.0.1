-- -----------------------------------------------
-- TABLE: ai_chat_sessions
-- Persists AI Buddy / Career / Doubt conversations
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    session_type        ENUM('buddy','career','doubt','interview') NOT NULL DEFAULT 'buddy',
    title               VARCHAR(200)        NULL,
    subject             VARCHAR(100)        NULL,
    message_count       INT UNSIGNED        NOT NULL DEFAULT 0,
    last_message_at     DATETIME            NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_acs_user (user_id, session_type),
    INDEX idx_acs_recent (user_id, last_message_at DESC),
    CONSTRAINT fk_acs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- TABLE: ai_chat_messages
-- Individual messages in AI chat sessions
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    session_id          INT UNSIGNED        NOT NULL,
    role                ENUM('user','assistant') NOT NULL,
    content             TEXT                NOT NULL,
    ai_provider         VARCHAR(30)         NULL,
    tokens_used         INT UNSIGNED        NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_acm_session (session_id, created_at),
    CONSTRAINT fk_acm_session FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
