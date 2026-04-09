-- Migration 059: Admin System & 2FA
-- UP

-- 1. Update users table for 2FA and Admin status
ALTER TABLE users 
ADD COLUMN is_2fa_enabled TINYINT(1) DEFAULT 0 AFTER is_profile_complete,
ADD COLUMN totp_secret VARCHAR(100) DEFAULT NULL AFTER is_2fa_enabled,
ADD COLUMN backup_codes JSON DEFAULT NULL AFTER totp_secret,
ADD COLUMN admin_role ENUM('super_admin', 'moderator', 'support', 'finance') DEFAULT NULL AFTER user_type;

-- 2. Create general admin audit logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id          INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    admin_id    INT UNSIGNED        NOT NULL,
    action_type VARCHAR(100)        NOT NULL COMMENT 'e.g., user_ban, post_delete, settings_change',
    target_type VARCHAR(50)         NOT NULL COMMENT 'e.g., users, posts, payments',
    target_id   INT UNSIGNED        NULL,
    old_value   JSON                NULL,
    new_value   JSON                NULL,
    reason      VARCHAR(500)        NULL,
    ip_address  VARCHAR(45)         NULL,
    user_agent  VARCHAR(255)        NULL,
    created_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_aal_admin (admin_id),
    INDEX idx_aal_type (action_type),
    INDEX idx_aal_target (target_type, target_id),
    CONSTRAINT fk_aal_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create a dedicated table for pending admin tasks/approvals
CREATE TABLE IF NOT EXISTS admin_pending_actions (
    id          INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    action_type ENUM('verify_teacher', 'verify_institute', 'payout_request', 'flagged_escalation') NOT NULL,
    target_id   INT UNSIGNED        NOT NULL,
    status      ENUM('pending', 'in_review', 'completed', 'rejected') DEFAULT 'pending',
    assigned_to INT UNSIGNED        NULL,
    meta        JSON                NULL,
    created_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_apa_status (status),
    INDEX idx_apa_type (action_type),
    CONSTRAINT fk_apa_assignee FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- ALTER TABLE users DROP COLUMN is_2fa_enabled, DROP COLUMN totp_secret, DROP COLUMN backup_codes, DROP COLUMN admin_role;
-- DROP TABLE IF EXISTS admin_audit_logs;
-- DROP TABLE IF EXISTS admin_pending_actions;
