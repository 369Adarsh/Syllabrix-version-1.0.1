-- Syllabrix Full Schema (Phase 1)
-- Auto-generated from migration files
-- DO NOT EDIT — update individual migration files instead

-- ==================================================
-- 001_create_users.sql
-- ==================================================
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


-- ==================================================
-- 002_create_student_profiles.sql
-- ==================================================
-- Migration 002: Create student_profiles table
-- Extended details for user_type = 'student'
-- UP
CREATE TABLE student_profiles (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    full_name           VARCHAR(150)        NOT NULL,
    age                 TINYINT UNSIGNED    NULL,
    school_name         VARCHAR(200)        NULL,
    class_name          VARCHAR(50)         NULL,
    board               ENUM('CBSE','ICSE','State Board','IB','IGCSE','Other') NULL,
    medium              ENUM('English','Hindi','Gujarati','Tamil','Telugu','Kannada','Malayalam','Marathi','Bengali','Other') NULL DEFAULT 'English',
    skills              JSON                NULL,
    interests           JSON                NULL,
    achievements_summary TEXT               NULL,
    syllabrix_score     DECIMAL(5,2)        NOT NULL DEFAULT 0.00,
    experience_xp       INT UNSIGNED        NOT NULL DEFAULT 0,
    guardian_user_id    INT UNSIGNED        NULL,
    requires_guardian   TINYINT(1)          NOT NULL DEFAULT 0,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_student_user_id (user_id),
    INDEX idx_student_school (school_name),
    INDEX idx_student_score (syllabrix_score),
    INDEX idx_student_guardian (guardian_user_id),
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_guardian FOREIGN KEY (guardian_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS student_profiles;


-- ==================================================
-- 003_create_teacher_profiles.sql
-- ==================================================
-- Migration 003: Create teacher_profiles table
-- Extended details for user_type = 'teacher'
-- UP
CREATE TABLE teacher_profiles (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    full_name           VARCHAR(150)        NOT NULL,
    subject_primary     VARCHAR(100)        NOT NULL,
    subjects_additional JSON                NULL,
    qualifications      JSON                NULL,
    teacher_type        ENUM('freelancer','institute_affiliated','both') NOT NULL DEFAULT 'freelancer',
    institute_name      VARCHAR(200)        NULL,
    institute_user_id   INT UNSIGNED        NULL,
    hourly_rate         DECIMAL(10,2)       NULL,
    currency            VARCHAR(3)          NOT NULL DEFAULT 'INR',
    experience_years    TINYINT UNSIGNED    NULL,
    rating              DECIMAL(3,2)        NOT NULL DEFAULT 0.00,
    total_ratings       INT UNSIGNED        NOT NULL DEFAULT 0,
    total_students      INT UNSIGNED        NOT NULL DEFAULT 0,
    total_classes       INT UNSIGNED        NOT NULL DEFAULT 0,
    verification_status ENUM('unverified','pending','verified','rejected') NOT NULL DEFAULT 'unverified',
    id_document_url     VARCHAR(500)        NULL,
    qualification_doc_url VARCHAR(500)      NULL,
    background_check_consent TINYINT(1)     NOT NULL DEFAULT 0,
    video_selfie_url    VARCHAR(500)        NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_teacher_user_id (user_id),
    INDEX idx_teacher_subject (subject_primary),
    INDEX idx_teacher_type (teacher_type),
    INDEX idx_teacher_rating (rating),
    INDEX idx_teacher_verification (verification_status),
    CONSTRAINT fk_teacher_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_teacher_institute FOREIGN KEY (institute_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS teacher_profiles;


-- ==================================================
-- 004_create_institute_profiles.sql
-- ==================================================
-- Migration 004: Create institute_profiles table
-- Extended details for user_type = 'institute'
-- UP
CREATE TABLE institute_profiles (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    name                VARCHAR(200)        NOT NULL,
    institute_type      ENUM('school','college','university','coaching','online_academy','other') NOT NULL,
    established_year    YEAR                NULL,
    registration_number VARCHAR(100)        NULL,
    udise_code          VARCHAR(50)         NULL,
    website             VARCHAR(300)        NULL,
    address_line1       VARCHAR(300)        NULL,
    address_line2       VARCHAR(300)        NULL,
    city                VARCHAR(100)        NULL,
    state               VARCHAR(100)        NULL,
    pincode             VARCHAR(10)         NULL,
    student_count       INT UNSIGNED        NOT NULL DEFAULT 0,
    teacher_count       INT UNSIGNED        NOT NULL DEFAULT 0,
    rating              DECIMAL(3,2)        NOT NULL DEFAULT 0.00,
    total_ratings       INT UNSIGNED        NOT NULL DEFAULT 0,
    verification_status ENUM('unverified','pending','verified','rejected') NOT NULL DEFAULT 'unverified',
    authorized_person   VARCHAR(150)        NULL,
    authorized_person_id_url VARCHAR(500)   NULL,
    logo_url            VARCHAR(500)        NULL,
    about               TEXT                NULL,
    facilities          JSON                NULL,
    boards_offered      JSON                NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_institute_user_id (user_id),
    INDEX idx_institute_type (institute_type),
    INDEX idx_institute_city (city),
    INDEX idx_institute_rating (rating),
    INDEX idx_institute_verification (verification_status),
    CONSTRAINT fk_institute_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS institute_profiles;


-- ==================================================
-- 005_create_parent_profiles.sql
-- ==================================================
-- Migration 005: Create parent_profiles table
-- Extended details for user_type = 'parent'
-- UP
CREATE TABLE parent_profiles (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    full_name           VARCHAR(150)        NOT NULL,
    relationship        ENUM('mother','father','guardian','other') NOT NULL,
    phone_verified      TINYINT(1)          NOT NULL DEFAULT 0,
    id_document_url     VARCHAR(500)        NULL,
    notification_email  VARCHAR(255)        NULL,
    weekly_report_enabled TINYINT(1)        NOT NULL DEFAULT 1,
    screen_time_limit_minutes INT UNSIGNED  NULL,
    content_filter_level ENUM('strict','moderate','standard') NOT NULL DEFAULT 'strict',
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_parent_user_id (user_id),
    CONSTRAINT fk_parent_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS parent_profiles;


-- ==================================================
-- 006_create_parent_child_links.sql
-- ==================================================
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


-- ==================================================
-- 007_create_user_groups.sql
-- ==================================================
-- Migration 007: Create user_groups table
-- Study groups, project groups, etc.
-- MUST come before posts (posts references user_groups)
-- UP
CREATE TABLE user_groups (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    name                VARCHAR(150)        NOT NULL,
    description         TEXT                NULL,
    group_type          ENUM('study','project','class','general') NOT NULL DEFAULT 'general',
    photo_url           VARCHAR(500)        NULL,
    creator_id          INT UNSIGNED        NOT NULL,
    member_count        INT UNSIGNED        NOT NULL DEFAULT 1,
    max_members         INT UNSIGNED        NOT NULL DEFAULT 100,
    is_active           TINYINT(1)          NOT NULL DEFAULT 1,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_groups_creator (creator_id),
    INDEX idx_groups_type (group_type),
    CONSTRAINT fk_groups_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS user_groups;


-- ==================================================
-- 008_create_group_members.sql
-- ==================================================
-- Migration 008: Create group_members table
-- Membership in groups
-- UP
CREATE TABLE group_members (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    group_id            INT UNSIGNED        NOT NULL,
    user_id             INT UNSIGNED        NOT NULL,
    role                ENUM('admin','moderator','member') NOT NULL DEFAULT 'member',
    joined_at           DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_group_member (group_id, user_id),
    INDEX idx_gm_user (user_id),
    CONSTRAINT fk_gm_group FOREIGN KEY (group_id) REFERENCES user_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_gm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS group_members;


-- ==================================================
-- 009_create_group_messages.sql
-- ==================================================
-- Migration 009: Create group_messages table
-- Messages within groups
-- UP
CREATE TABLE group_messages (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    group_id            INT UNSIGNED        NOT NULL,
    user_id             INT UNSIGNED        NOT NULL,
    content             TEXT                NOT NULL,
    media_url           VARCHAR(500)        NULL,
    media_type          ENUM('none','image','video','document','voice') NOT NULL DEFAULT 'none',
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_gmsg_group (group_id, created_at),
    INDEX idx_gmsg_user (user_id),
    CONSTRAINT fk_gmsg_group FOREIGN KEY (group_id) REFERENCES user_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_gmsg_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS group_messages;


-- ==================================================
-- 010_create_posts.sql
-- ==================================================
-- Migration 010: Create posts table
-- All user-generated posts (text, photo, video, document)
-- UP
CREATE TABLE posts (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    content             TEXT                NULL,
    media_url           VARCHAR(500)        NULL,
    media_type          ENUM('none','image','video','document','multiple') NOT NULL DEFAULT 'none',
    media_urls          JSON                NULL,
    visibility          ENUM('public','followers','group','private') NOT NULL DEFAULT 'public',
    group_id            INT UNSIGNED        NULL,
    post_type           ENUM('regular','achievement','experience_share','repost','project_showcase') NOT NULL DEFAULT 'regular',
    original_post_id    INT UNSIGNED        NULL,
    hashtags            JSON                NULL,
    likes_count         INT UNSIGNED        NOT NULL DEFAULT 0,
    comments_count      INT UNSIGNED        NOT NULL DEFAULT 0,
    shares_count        INT UNSIGNED        NOT NULL DEFAULT 0,
    saves_count         INT UNSIGNED        NOT NULL DEFAULT 0,
    is_active           TINYINT(1)          NOT NULL DEFAULT 1,
    is_flagged          TINYINT(1)          NOT NULL DEFAULT 0,
    flag_reason         VARCHAR(255)        NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_posts_user (user_id),
    INDEX idx_posts_type (post_type),
    INDEX idx_posts_visibility (visibility),
    INDEX idx_posts_group (group_id),
    INDEX idx_posts_active (is_active),
    INDEX idx_posts_created (created_at),
    INDEX idx_posts_original (original_post_id),
    CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_posts_group FOREIGN KEY (group_id) REFERENCES user_groups(id) ON DELETE SET NULL,
    CONSTRAINT fk_posts_original FOREIGN KEY (original_post_id) REFERENCES posts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS posts;


-- ==================================================
-- 011_create_post_likes.sql
-- ==================================================
-- Migration 011: Create post_likes table
-- Positivity-only reactions
-- UP
CREATE TABLE post_likes (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    post_id             INT UNSIGNED        NOT NULL,
    reaction_type       ENUM('like','amazing','keep_going','congratulations','smart','well_done','love','rocket','learning') NOT NULL DEFAULT 'like',
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_like_user_post (user_id, post_id),
    INDEX idx_likes_post (post_id),
    CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_likes_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS post_likes;


-- ==================================================
-- 012_create_post_comments.sql
-- ==================================================
-- Migration 012: Create post_comments table
-- Comments on posts (positivity-checked before saving)
-- UP
CREATE TABLE post_comments (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    post_id             INT UNSIGNED        NOT NULL,
    parent_comment_id   INT UNSIGNED        NULL,
    content             TEXT                NOT NULL,
    positivity_score    DECIMAL(3,2)        NULL,
    is_active           TINYINT(1)          NOT NULL DEFAULT 1,
    is_flagged          TINYINT(1)          NOT NULL DEFAULT 0,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_comments_post (post_id),
    INDEX idx_comments_user (user_id),
    INDEX idx_comments_parent (parent_comment_id),
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_parent FOREIGN KEY (parent_comment_id) REFERENCES post_comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS post_comments;


-- ==================================================
-- 013_create_post_shares.sql
-- ==================================================
-- Migration 013: Create post_shares table
-- Shares/reposts tracking
-- UP
CREATE TABLE post_shares (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    post_id             INT UNSIGNED        NOT NULL,
    shared_post_id      INT UNSIGNED        NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_shares_user (user_id),
    INDEX idx_shares_post (post_id),
    CONSTRAINT fk_shares_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_shares_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS post_shares;


-- ==================================================
-- 014_create_post_saves.sql
-- ==================================================
-- Migration 014: Create post_saves table
-- Bookmarked/saved posts
-- UP
CREATE TABLE post_saves (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    post_id             INT UNSIGNED        NOT NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_save_user_post (user_id, post_id),
    INDEX idx_saves_post (post_id),
    CONSTRAINT fk_saves_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_saves_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS post_saves;


-- ==================================================
-- 015_create_follows.sql
-- ==================================================
-- Migration 015: Create follows table
-- User follow relationships
-- UP
CREATE TABLE follows (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    follower_id         INT UNSIGNED        NOT NULL,
    following_id        INT UNSIGNED        NOT NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_follow (follower_id, following_id),
    INDEX idx_follows_following (following_id),
    CONSTRAINT fk_follows_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_follows_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS follows;


-- ==================================================
-- 016_create_messages.sql
-- ==================================================
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


-- ==================================================
-- 017_create_notifications.sql
-- ==================================================
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


-- ==================================================
-- 018_create_hashtags.sql
-- ==================================================
-- Migration 018: Create hashtags table
-- Master hashtag list
-- UP
CREATE TABLE hashtags (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    tag                 VARCHAR(100)        NOT NULL,
    post_count          INT UNSIGNED        NOT NULL DEFAULT 0,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_hashtag_tag (tag),
    INDEX idx_hashtag_count (post_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS hashtags;


-- ==================================================
-- 019_create_post_hashtags.sql
-- ==================================================
-- Migration 019: Create post_hashtags table
-- Links posts to hashtags (junction table)
-- UP
CREATE TABLE post_hashtags (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    post_id             INT UNSIGNED        NOT NULL,
    hashtag_id          INT UNSIGNED        NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_post_hashtag (post_id, hashtag_id),
    INDEX idx_ph_hashtag (hashtag_id),
    CONSTRAINT fk_ph_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_ph_hashtag FOREIGN KEY (hashtag_id) REFERENCES hashtags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS post_hashtags;


-- ==================================================
-- 020_create_jobs.sql
-- ==================================================
-- Migration 020: Create jobs table
-- Job postings by institutes and teachers
-- UP
CREATE TABLE jobs (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    posted_by           INT UNSIGNED        NOT NULL,
    title               VARCHAR(200)        NOT NULL,
    description         TEXT                NOT NULL,
    institute_name      VARCHAR(200)        NULL,
    job_type            ENUM('full_time','part_time','freelance','contract','online_only') NOT NULL,
    subject             VARCHAR(100)        NULL,
    experience_required VARCHAR(50)         NULL,
    salary_min          DECIMAL(12,2)       NULL,
    salary_max          DECIMAL(12,2)       NULL,
    salary_currency     VARCHAR(3)          NOT NULL DEFAULT 'INR',
    salary_period       ENUM('hourly','monthly','yearly') NOT NULL DEFAULT 'monthly',
    location            VARCHAR(200)        NULL,
    is_remote           TINYINT(1)          NOT NULL DEFAULT 0,
    is_urgent           TINYINT(1)          NOT NULL DEFAULT 0,
    is_active           TINYINT(1)          NOT NULL DEFAULT 1,
    application_count   INT UNSIGNED        NOT NULL DEFAULT 0,
    expires_at          DATE                NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_jobs_posted_by (posted_by),
    INDEX idx_jobs_type (job_type),
    INDEX idx_jobs_subject (subject),
    INDEX idx_jobs_location (location),
    INDEX idx_jobs_active (is_active, created_at),
    CONSTRAINT fk_jobs_poster FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS jobs;


-- ==================================================
-- 021_create_job_applications.sql
-- ==================================================
-- Migration 021: Create job_applications table
-- Applications to jobs
-- UP
CREATE TABLE job_applications (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    job_id              INT UNSIGNED        NOT NULL,
    applicant_id        INT UNSIGNED        NOT NULL,
    cover_message       TEXT                NULL,
    resume_url          VARCHAR(500)        NULL,
    status              ENUM('applied','viewed','shortlisted','rejected','accepted') NOT NULL DEFAULT 'applied',
    status_updated_at   DATETIME            NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_job_applicant (job_id, applicant_id),
    INDEX idx_ja_applicant (applicant_id),
    INDEX idx_ja_status (status),
    CONSTRAINT fk_ja_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_ja_applicant FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS job_applications;


-- ==================================================
-- 022_create_tuition_ads.sql
-- ==================================================
-- Migration 022: Create tuition_ads table
-- Private tuition advertisements (by teachers or students)
-- UP
CREATE TABLE tuition_ads (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    ad_type             ENUM('offering_tuition','seeking_tutor') NOT NULL,
    title               VARCHAR(200)        NOT NULL,
    description         TEXT                NULL,
    subject             VARCHAR(100)        NOT NULL,
    class_range         VARCHAR(50)         NULL,
    location            VARCHAR(200)        NULL,
    is_online           TINYINT(1)          NOT NULL DEFAULT 0,
    budget_min          DECIMAL(10,2)       NULL,
    budget_max          DECIMAL(10,2)       NULL,
    budget_period       ENUM('hourly','monthly','per_session') NOT NULL DEFAULT 'monthly',
    is_active           TINYINT(1)          NOT NULL DEFAULT 1,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_tuition_user (user_id),
    INDEX idx_tuition_type (ad_type),
    INDEX idx_tuition_subject (subject),
    INDEX idx_tuition_active (is_active, created_at),
    CONSTRAINT fk_tuition_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS tuition_ads;


-- ==================================================
-- 023_create_user_blocks.sql
-- ==================================================
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


-- ==================================================
-- 024_create_reports.sql
-- ==================================================
-- Migration 024: Create reports table
-- Content and user reports
-- UP
CREATE TABLE reports (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    reporter_id         INT UNSIGNED        NOT NULL,
    reported_user_id    INT UNSIGNED        NULL,
    reported_post_id    INT UNSIGNED        NULL,
    reported_comment_id INT UNSIGNED        NULL,
    reported_message_id INT UNSIGNED        NULL,
    reason              ENUM('spam','harassment','inappropriate','hate_speech','bullying','self_harm','impersonation','misinformation','other') NOT NULL,
    description         TEXT                NULL,
    status              ENUM('pending','reviewed','action_taken','dismissed') NOT NULL DEFAULT 'pending',
    reviewer_note       TEXT                NULL,
    reviewed_at         DATETIME            NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_reports_reporter (reporter_id),
    INDEX idx_reports_status (status),
    INDEX idx_reports_user (reported_user_id),
    INDEX idx_reports_post (reported_post_id),
    CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reports_user FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_reports_post FOREIGN KEY (reported_post_id) REFERENCES posts(id) ON DELETE SET NULL,
    CONSTRAINT fk_reports_comment FOREIGN KEY (reported_comment_id) REFERENCES post_comments(id) ON DELETE SET NULL,
    CONSTRAINT fk_reports_message FOREIGN KEY (reported_message_id) REFERENCES messages(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS reports;


-- ==================================================
-- 025_create_search_history.sql
-- ==================================================
-- Migration 025: Create search_history table
-- User search tracking (for recommendations)
-- UP
CREATE TABLE search_history (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    query               VARCHAR(255)        NOT NULL,
    result_type         ENUM('user','post','job','tuition','hashtag','category') NULL,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_search_user (user_id, created_at),
    CONSTRAINT fk_search_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS search_history;


-- ==================================================
-- 026_create_user_sessions.sql
-- ==================================================
-- Migration 026: Create user_sessions table
-- JWT token tracking for security
-- UP
CREATE TABLE user_sessions (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id             INT UNSIGNED        NOT NULL,
    token_hash          VARCHAR(255)        NOT NULL,
    device_info         VARCHAR(500)        NULL,
    ip_address          VARCHAR(45)         NULL,
    expires_at          DATETIME            NOT NULL,
    is_active           TINYINT(1)          NOT NULL DEFAULT 1,
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_token (token_hash),
    INDEX idx_sessions_active (is_active, expires_at),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS user_sessions;


