-- ═══════════════════════════════════════════════════════════
-- MILESTONE 3: Revenue + Certificates
-- 3 new tables: subscriptions, payments, certificates
-- ═══════════════════════════════════════════════════════════

-- TABLE: subscriptions
-- Manages Parent Pro, Certificate Plans, Premium features
CREATE TABLE IF NOT EXISTS subscriptions (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    plan_type           ENUM('parent_pro','certificate_unlimited','premium_student') NOT NULL,
    plan_name           VARCHAR(100)        NOT NULL,
    amount_inr          DECIMAL(10,2)       NOT NULL,
    currency            VARCHAR(3)          NOT NULL DEFAULT 'INR',
    billing_cycle       ENUM('monthly','quarterly','yearly','one_time') NOT NULL DEFAULT 'monthly',
    status              ENUM('active','cancelled','expired','trial','pending') NOT NULL DEFAULT 'pending',
    trial_ends_at       DATETIME            NULL,
    current_period_start DATETIME           NULL,
    current_period_end  DATETIME            NULL,
    razorpay_subscription_id VARCHAR(100)   NULL,
    razorpay_customer_id VARCHAR(100)       NULL,
    cancelled_at        DATETIME            NULL,
    cancellation_reason VARCHAR(500)        NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_sub_user (user_id, plan_type),
    INDEX idx_sub_status (status),
    INDEX idx_sub_razorpay (razorpay_subscription_id),
    CONSTRAINT fk_sub_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: payments
-- All payment transactions (one-time + subscription renewals)
CREATE TABLE IF NOT EXISTS payments (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    subscription_id     INT UNSIGNED        NULL,
    payment_type        ENUM('subscription','certificate','doubt_session','live_class','course','donation') NOT NULL,
    amount_inr          DECIMAL(10,2)       NOT NULL,
    currency            VARCHAR(3)          NOT NULL DEFAULT 'INR',
    status              ENUM('created','authorized','captured','failed','refunded') NOT NULL DEFAULT 'created',
    razorpay_order_id   VARCHAR(100)        NULL,
    razorpay_payment_id VARCHAR(100)        NULL,
    razorpay_signature  VARCHAR(200)        NULL,
    description         VARCHAR(500)        NULL,
    metadata            JSON                NULL,
    paid_at             DATETIME            NULL,
    refunded_at         DATETIME            NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_pay_user (user_id),
    INDEX idx_pay_status (status),
    INDEX idx_pay_type (payment_type),
    INDEX idx_pay_razorpay (razorpay_order_id),
    CONSTRAINT fk_pay_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_pay_sub FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: certificates
-- QR-verified Skills Passport certificates
CREATE TABLE IF NOT EXISTS certificates (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    certificate_type    ENUM('skill_completion','course_completion','quiz_achievement','experience_lab','mentorship','streak_milestone','custom') NOT NULL,
    title               VARCHAR(300)        NOT NULL,
    description         TEXT                NULL,
    issued_for          VARCHAR(300)        NULL,
    skills              JSON                NULL,
    score               DECIMAL(5,2)        NULL,
    grade               VARCHAR(10)         NULL,
    qr_code             VARCHAR(100)        NOT NULL,
    verification_url    VARCHAR(500)        NOT NULL,
    pdf_url             VARCHAR(500)        NULL,
    payment_id          INT UNSIGNED        NULL,
    is_paid             TINYINT(1)          NOT NULL DEFAULT 0,
    is_published        TINYINT(1)          NOT NULL DEFAULT 1,
    issued_at           DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at          DATETIME            NULL,
    downloaded_count    INT UNSIGNED        NOT NULL DEFAULT 0,
    verified_count      INT UNSIGNED        NOT NULL DEFAULT 0,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_cert_qr (qr_code),
    INDEX idx_cert_user (user_id),
    INDEX idx_cert_type (certificate_type),
    INDEX idx_cert_verify (qr_code),
    CONSTRAINT fk_cert_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_cert_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TABLE: doubt_sessions (paid instant doubt solving)
CREATE TABLE IF NOT EXISTS doubt_sessions (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    student_id          INT UNSIGNED        NOT NULL,
    teacher_id          INT UNSIGNED        NULL,
    subject             VARCHAR(100)        NOT NULL,
    question            TEXT                NOT NULL,
    status              ENUM('pending','matched','in_progress','resolved','cancelled','expired') NOT NULL DEFAULT 'pending',
    mode                ENUM('ai','teacher_live','teacher_async') NOT NULL DEFAULT 'ai',
    ai_answer           TEXT                NULL,
    teacher_answer      TEXT                NULL,
    rating              TINYINT UNSIGNED    NULL,
    feedback            VARCHAR(500)        NULL,
    amount_inr          DECIMAL(10,2)       NOT NULL DEFAULT 0.00,
    payment_id          INT UNSIGNED        NULL,
    is_paid             TINYINT(1)          NOT NULL DEFAULT 0,
    started_at          DATETIME            NULL,
    resolved_at         DATETIME            NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_ds_student (student_id, status),
    INDEX idx_ds_teacher (teacher_id, status),
    INDEX idx_ds_status (status),
    CONSTRAINT fk_ds_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ds_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_ds_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
