-- Migration 001: Create users table
-- The master user table. Every person on the platform.
-- UP
CREATE TABLE users (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    username            VARCHAR(50)         NOT NULL,
    email               VARCHAR(255)        NOT NULL,
    password_hash       VARCHAR(255)        NOT NULL,
    user_type           ENUM('student','teacher','institute','parent','mentor') NOT NULL,
    age_group           ENUM('5-7','8-10','11-13','14-15','16-17','18+') NOT NULL DEFAULT '18+',
    date_of_birth       DATE                NULL,
    phone               VARCHAR(20)         NULL,
    profile_photo_url   VARCHAR(500)        NULL,
    cover_photo_url     VARCHAR(500)        NULL,
    bio                 TEXT                NULL,
    gender              ENUM('male','female','other','prefer_not_to_say') NULL,
    city                VARCHAR(100)        NULL,
    state               VARCHAR(100)        NULL,
    country             VARCHAR(100)        NOT NULL DEFAULT 'India',
    is_verified         TINYINT(1)          NOT NULL DEFAULT 0,
    is_active           TINYINT(1)          NOT NULL DEFAULT 1,
    is_profile_complete TINYINT(1)          NOT NULL DEFAULT 0,
    is_banned           TINYINT(1)          NOT NULL DEFAULT 0,
    strike_count        TINYINT UNSIGNED    NOT NULL DEFAULT 0,
    last_login_at       DATETIME            NULL,
    email_verified_at   DATETIME            NULL,
    phone_verified_at   DATETIME            NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_username (username),
    UNIQUE KEY uk_users_email (email),
    INDEX idx_users_user_type (user_type),
    INDEX idx_users_age_group (age_group),
    INDEX idx_users_city (city),
    INDEX idx_users_is_active (is_active),
    INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS users;
