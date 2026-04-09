-- ============================================================
-- SYLLABRIX L&D PLATFORM — BUSINESS CHALLENGES SCHEMA
-- Phase: ld | Migration: 003
-- Covers: Challenges, Root Cause, ROI Linkage
-- ============================================================

-- UP

CREATE TABLE IF NOT EXISTS ld_challenges (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  org_id          INT UNSIGNED NOT NULL,
  department      VARCHAR(150) DEFAULT NULL,
  title           VARCHAR(300) NOT NULL,
  impact          TEXT DEFAULT NULL,
  root_cause      TEXT DEFAULT NULL,
  solution        TEXT DEFAULT NULL,
  result          TEXT DEFAULT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_challenge_org (org_id),
  INDEX idx_challenge_dept (org_id, department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN
-- DROP TABLE IF EXISTS ld_challenges;
