-- ============================================================
-- SYLLABRIX L&D PLATFORM — CONTENT & LMS SCHEMA
-- Phase: ld | Migration: 002
-- Covers: Programs, Modules, Assessments, Enrollments, Reviews
-- ============================================================

-- UP

-- 1. Programs (courses/training programs)
CREATE TABLE IF NOT EXISTS ld_programs (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  org_id          INT UNSIGNED NOT NULL,
  title           VARCHAR(300) NOT NULL,
  description     TEXT DEFAULT NULL,
  target_skill_id INT UNSIGNED DEFAULT NULL,
  program_type    ENUM('course','microlearning','compliance','onboarding','workshop','certification') DEFAULT 'course',
  difficulty      ENUM('beginner','intermediate','advanced','expert') DEFAULT 'intermediate',
  duration_hours  DECIMAL(5,1) DEFAULT NULL,
  language        VARCHAR(10) DEFAULT 'en',
  tone            ENUM('formal','conversational','technical','casual') DEFAULT 'formal',
  cover_image_url VARCHAR(500) DEFAULT NULL,
  status          ENUM('draft','in_review','published','archived') DEFAULT 'draft',
  is_mandatory    TINYINT(1) DEFAULT 0,
  compliance_deadline DATE DEFAULT NULL,
  target_audience JSON DEFAULT NULL COMMENT '{"departments":[],"roles":[],"levels":[]}',
  tags            JSON DEFAULT NULL,
  created_by      INT UNSIGNED NOT NULL,
  published_at    DATETIME DEFAULT NULL,
  meta            JSON DEFAULT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at      DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX idx_prog_org (org_id),
  INDEX idx_prog_status (org_id, status),
  INDEX idx_prog_skill (target_skill_id),
  INDEX idx_prog_type (org_id, program_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Modules (sections within a program)
CREATE TABLE IF NOT EXISTS ld_modules (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  program_id      INT UNSIGNED NOT NULL,
  title           VARCHAR(300) NOT NULL,
  module_type     ENUM('intro','concept','application','case_study','quiz','summary','video','activity') DEFAULT 'concept',
  order_index     INT UNSIGNED NOT NULL DEFAULT 0,
  content         LONGTEXT DEFAULT NULL,
  content_format  ENUM('markdown','html','scorm','video_url','pdf_url') DEFAULT 'markdown',
  duration_min    INT UNSIGNED DEFAULT 15,
  is_optional     TINYINT(1) DEFAULT 0,
  ai_generated    TINYINT(1) DEFAULT 0,
  meta            JSON DEFAULT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_mod_program (program_id, order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Assessments (quizzes, pre/post tests, scenario-based)
CREATE TABLE IF NOT EXISTS ld_assessments (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  module_id       INT UNSIGNED DEFAULT NULL,
  program_id      INT UNSIGNED NOT NULL,
  title           VARCHAR(300) DEFAULT NULL,
  assessment_type ENUM('pre_test','post_test','module_quiz','scenario','open_ended','skill_check') DEFAULT 'module_quiz',
  questions       JSON NOT NULL COMMENT '[{q,type,options,correct,explanation,rubric}]',
  passing_score   TINYINT UNSIGNED DEFAULT 60,
  time_limit_min  INT UNSIGNED DEFAULT NULL,
  max_attempts    TINYINT UNSIGNED DEFAULT 3,
  ai_generated    TINYINT(1) DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_assess_program (program_id),
  INDEX idx_assess_module (module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Enrollments (learner ↔ program)
CREATE TABLE IF NOT EXISTS ld_enrollments (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id         INT UNSIGNED NOT NULL,
  program_id      INT UNSIGNED NOT NULL,
  org_id          INT UNSIGNED NOT NULL,
  status          ENUM('enrolled','in_progress','completed','dropped','expired') DEFAULT 'enrolled',
  progress_pct    TINYINT UNSIGNED DEFAULT 0,
  current_module  INT UNSIGNED DEFAULT NULL,
  pre_score       DECIMAL(5,2) DEFAULT NULL,
  post_score      DECIMAL(5,2) DEFAULT NULL,
  l2_gain_pct     DECIMAL(5,2) DEFAULT NULL COMMENT 'post - pre',
  enrolled_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at      DATETIME DEFAULT NULL,
  completed_at    DATETIME DEFAULT NULL,
  due_date        DATE DEFAULT NULL,
  certificate_id  VARCHAR(100) DEFAULT NULL,
  meta            JSON DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_enrollment (user_id, program_id),
  INDEX idx_enroll_org (org_id, status),
  INDEX idx_enroll_user (user_id, status),
  INDEX idx_enroll_due (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Module progress (per learner per module)
CREATE TABLE IF NOT EXISTS ld_module_progress (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  enrollment_id   INT UNSIGNED NOT NULL,
  module_id       INT UNSIGNED NOT NULL,
  status          ENUM('locked','available','in_progress','completed','skipped') DEFAULT 'available',
  score           DECIMAL(5,2) DEFAULT NULL,
  time_spent_sec  INT UNSIGNED DEFAULT 0,
  attempts        TINYINT UNSIGNED DEFAULT 0,
  started_at      DATETIME DEFAULT NULL,
  completed_at    DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_progress (enrollment_id, module_id),
  INDEX idx_mp_module (module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. SME Reviews (content approval workflow)
CREATE TABLE IF NOT EXISTS ld_reviews (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  org_id          INT UNSIGNED NOT NULL,
  content_type    ENUM('program','module','assessment','knowledge_item') NOT NULL,
  content_id      INT UNSIGNED NOT NULL,
  reviewer_id     INT UNSIGNED NOT NULL,
  status          ENUM('pending','approved','revision_requested','rejected') DEFAULT 'pending',
  comments        TEXT DEFAULT NULL,
  inline_comments JSON DEFAULT NULL COMMENT '[{blockId, text, resolved}]',
  bias_score      DECIMAL(4,3) DEFAULT NULL,
  hallucination_score DECIMAL(4,3) DEFAULT NULL,
  reviewed_at     DATETIME DEFAULT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_review_org (org_id, status),
  INDEX idx_review_content (content_type, content_id),
  INDEX idx_review_reviewer (reviewer_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. AI Audit Logs (governance trail)
CREATE TABLE IF NOT EXISTS ld_ai_audit_logs (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  org_id          INT UNSIGNED NOT NULL,
  user_id         INT UNSIGNED DEFAULT NULL,
  action_type     ENUM('content_gen','assessment_gen','course_outline','skill_extract','coach_chat','recommendation','bias_check','translation') NOT NULL,
  model_used      VARCHAR(100) DEFAULT NULL,
  model_version   VARCHAR(50) DEFAULT NULL,
  prompt_hash     VARCHAR(64) DEFAULT NULL,
  input_summary   TEXT DEFAULT NULL,
  output_summary  TEXT DEFAULT NULL,
  tokens_used     INT UNSIGNED DEFAULT NULL,
  bias_score      DECIMAL(4,3) DEFAULT NULL,
  hallucination_score DECIMAL(4,3) DEFAULT NULL,
  latency_ms      INT UNSIGNED DEFAULT NULL,
  status          ENUM('success','failed','flagged') DEFAULT 'success',
  meta            JSON DEFAULT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_audit_org (org_id, action_type),
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Knowledge Base (tribal knowledge capture)
CREATE TABLE IF NOT EXISTS ld_knowledge_items (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  org_id          INT UNSIGNED NOT NULL,
  title           VARCHAR(300) NOT NULL,
  body            LONGTEXT NOT NULL,
  item_type       ENUM('tip','process','guide','faq','video','article') DEFAULT 'tip',
  tags            JSON DEFAULT NULL,
  skill_ids       JSON DEFAULT NULL,
  contributor_id  INT UNSIGNED NOT NULL,
  status          ENUM('draft','in_review','published','archived') DEFAULT 'draft',
  views           INT UNSIGNED DEFAULT 0,
  helpful_count   INT UNSIGNED DEFAULT 0,
  media_urls      JSON DEFAULT NULL,
  published_at    DATETIME DEFAULT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_kb_org (org_id, status),
  INDEX idx_kb_contributor (contributor_id),
  FULLTEXT idx_kb_search (title, body)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Impact tracking (Kirkpatrick L1-L4)
CREATE TABLE IF NOT EXISTS ld_impact_records (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  org_id          INT UNSIGNED NOT NULL,
  program_id      INT UNSIGNED NOT NULL,
  level           ENUM('L1_reaction','L2_learning','L3_behavior','L4_results') NOT NULL,
  user_id         INT UNSIGNED DEFAULT NULL,
  score           DECIMAL(5,2) DEFAULT NULL,
  data            JSON DEFAULT NULL COMMENT 'Survey answers, observation notes, KPI values',
  recorded_by     INT UNSIGNED DEFAULT NULL,
  recorded_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_impact_program (program_id, level),
  INDEX idx_impact_org (org_id, level),
  INDEX idx_impact_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Manager observations (behavior tracking)
CREATE TABLE IF NOT EXISTS ld_observations (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  org_id          INT UNSIGNED NOT NULL,
  manager_id      INT UNSIGNED NOT NULL,
  employee_id     INT UNSIGNED NOT NULL,
  program_id      INT UNSIGNED DEFAULT NULL,
  skill_id        INT UNSIGNED DEFAULT NULL,
  behavior        TEXT NOT NULL,
  context         TEXT DEFAULT NULL,
  evidence_type   ENUM('positive','needs_improvement','not_observed') DEFAULT 'positive',
  observed_at     DATE NOT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_obs_manager (manager_id),
  INDEX idx_obs_employee (employee_id),
  INDEX idx_obs_program (program_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Spaced repetition schedule
CREATE TABLE IF NOT EXISTS ld_repetition_schedule (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id         INT UNSIGNED NOT NULL,
  program_id      INT UNSIGNED NOT NULL,
  nudge_day       TINYINT UNSIGNED NOT NULL COMMENT 'Days after completion: 1,7,14,30',
  content         JSON DEFAULT NULL COMMENT 'Concept refreshers',
  channel         ENUM('in_app','email','push','slack','sms') DEFAULT 'in_app',
  status          ENUM('scheduled','sent','completed','skipped') DEFAULT 'scheduled',
  scheduled_for   DATETIME NOT NULL,
  sent_at         DATETIME DEFAULT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_rep_user (user_id, status),
  INDEX idx_rep_scheduled (scheduled_for, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- (reverse order)
