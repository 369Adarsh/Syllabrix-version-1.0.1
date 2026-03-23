-- Migration 027: Create live_classes table
-- UP
CREATE TABLE live_classes (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    host_id             INT UNSIGNED        NOT NULL,
    title               VARCHAR(200)        NOT NULL,
    description         TEXT                NULL,
    subject             VARCHAR(100)        NULL,
    class_type          ENUM('free','paid') NOT NULL DEFAULT 'free',
    price               DECIMAL(10,2)       NULL,
    currency            VARCHAR(3)          NOT NULL DEFAULT 'INR',
    max_students        INT UNSIGNED        NOT NULL DEFAULT 100,
    scheduled_at        DATETIME            NOT NULL,
    duration_minutes    INT UNSIGNED        NOT NULL DEFAULT 60,
    status              ENUM('scheduled','live','ended','cancelled') NOT NULL DEFAULT 'scheduled',
    started_at          DATETIME            NULL,
    ended_at            DATETIME            NULL,
    recording_url       VARCHAR(500)        NULL,
    viewer_count        INT UNSIGNED        NOT NULL DEFAULT 0,
    peak_viewers        INT UNSIGNED        NOT NULL DEFAULT 0,
    room_id             VARCHAR(100)        NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_lc_host (host_id),
    INDEX idx_lc_status (status),
    INDEX idx_lc_scheduled (scheduled_at),
    INDEX idx_lc_subject (subject),
    CONSTRAINT fk_lc_host FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS live_classes;
