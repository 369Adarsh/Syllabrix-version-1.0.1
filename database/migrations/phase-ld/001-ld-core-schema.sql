-- ============================================================
-- SYLLABRIX L&D PLATFORM — CORE SCHEMA
-- Phase: ld | Migration: 001
-- Covers: Organizations, Roles, Skills, Taxonomy, Profiles
-- ============================================================

-- UP

-- 1. Organizations (multi-tenant foundation)
CREATE TABLE IF NOT EXISTS ld_organizations (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(200) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  logo_url    VARCHAR(500) DEFAULT NULL,
  industry    VARCHAR(100) DEFAULT NULL,
  size_band   ENUM('1-50','51-200','201-500','501-1000','1000+') DEFAULT '51-200',
  plan        ENUM('free','starter','professional','enterprise') DEFAULT 'free',
  settings    JSON DEFAULT NULL,
  created_by  INT UNSIGNED DEFAULT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX idx_org_slug (slug),
  INDEX idx_org_industry (industry)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Organization memberships (links users to orgs with org-level roles)
CREATE TABLE IF NOT EXISTS ld_org_members (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  org_id      INT UNSIGNED NOT NULL,
  user_id     INT UNSIGNED NOT NULL,
  org_role    ENUM('owner','ld_admin','manager','sme','learner') NOT NULL DEFAULT 'learner',
  department  VARCHAR(150) DEFAULT NULL,
  team        VARCHAR(150) DEFAULT NULL,
  job_title   VARCHAR(200) DEFAULT NULL,
  manager_id  INT UNSIGNED DEFAULT NULL,
  status      ENUM('active','invited','deactivated') DEFAULT 'active',
  joined_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  meta        JSON DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_org_user (org_id, user_id),
  INDEX idx_member_user (user_id),
  INDEX idx_member_manager (manager_id),
  INDEX idx_member_dept (org_id, department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Departments (hierarchical)
CREATE TABLE IF NOT EXISTS ld_departments (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  org_id      INT UNSIGNED NOT NULL,
  name        VARCHAR(200) NOT NULL,
  parent_id   INT UNSIGNED DEFAULT NULL,
  head_user_id INT UNSIGNED DEFAULT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_dept_org (org_id),
  INDEX idx_dept_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Roles (job roles in the org, not auth roles)
CREATE TABLE IF NOT EXISTS ld_roles (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  org_id      INT UNSIGNED NOT NULL,
  title       VARCHAR(200) NOT NULL,
  department  VARCHAR(150) DEFAULT NULL,
  level       ENUM('entry','mid','senior','lead','director','executive') DEFAULT 'mid',
  description TEXT DEFAULT NULL,
  jd_text     TEXT DEFAULT NULL,
  is_active   TINYINT(1) DEFAULT 1,
  meta        JSON DEFAULT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_role_org (org_id),
  INDEX idx_role_dept (org_id, department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Skills (master skill catalog per org)
CREATE TABLE IF NOT EXISTS ld_skills (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  org_id       INT UNSIGNED NOT NULL,
  name         VARCHAR(200) NOT NULL,
  category     VARCHAR(100) DEFAULT 'General',
  skill_type   ENUM('technical','soft','domain','compliance','leadership') DEFAULT 'technical',
  synonyms     JSON DEFAULT NULL,
  description  TEXT DEFAULT NULL,
  is_global    TINYINT(1) DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_skill_org_name (org_id, name),
  INDEX idx_skill_category (org_id, category),
  INDEX idx_skill_type (org_id, skill_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Role-Skill mapping (which skills are needed for which roles)
CREATE TABLE IF NOT EXISTS ld_role_skills (
  id                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_id              INT UNSIGNED NOT NULL,
  skill_id             INT UNSIGNED NOT NULL,
  required_proficiency TINYINT UNSIGNED NOT NULL DEFAULT 3 COMMENT '1-5 scale',
  criticality_weight   TINYINT UNSIGNED NOT NULL DEFAULT 5 COMMENT '1-10 scale',
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_role_skill (role_id, skill_id),
  INDEX idx_rs_skill (skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Employee Skill Profiles (self + manager ratings)
CREATE TABLE IF NOT EXISTS ld_skill_profiles (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id         INT UNSIGNED NOT NULL,
  skill_id        INT UNSIGNED NOT NULL,
  org_id          INT UNSIGNED NOT NULL,
  self_rating     TINYINT UNSIGNED DEFAULT NULL COMMENT '1-5',
  manager_rating  TINYINT UNSIGNED DEFAULT NULL COMMENT '1-5',
  ai_inferred     TINYINT UNSIGNED DEFAULT NULL COMMENT '1-5',
  composite_score DECIMAL(3,2) DEFAULT NULL COMMENT 'Weighted avg',
  evidence        JSON DEFAULT NULL COMMENT 'Sources: self, manager, jira, etc.',
  assessed_at     DATETIME DEFAULT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_skill (user_id, skill_id),
  INDEX idx_sp_org (org_id),
  INDEX idx_sp_composite (org_id, composite_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Skill assessment history (audit trail)
CREATE TABLE IF NOT EXISTS ld_skill_history (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  profile_id  INT UNSIGNED NOT NULL,
  source      ENUM('self','manager','ai','system') NOT NULL,
  old_value   TINYINT UNSIGNED DEFAULT NULL,
  new_value   TINYINT UNSIGNED NOT NULL,
  notes       TEXT DEFAULT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_sh_profile (profile_id),
  INDEX idx_sh_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS ld_skill_history;
-- DROP TABLE IF EXISTS ld_skill_profiles;
-- DROP TABLE IF EXISTS ld_role_skills;
-- DROP TABLE IF EXISTS ld_skills;
-- DROP TABLE IF EXISTS ld_roles;
-- DROP TABLE IF EXISTS ld_departments;
-- DROP TABLE IF EXISTS ld_org_members;
-- DROP TABLE IF EXISTS ld_organizations;
