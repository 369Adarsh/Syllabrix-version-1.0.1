-- Migration 094: Add missing library columns to existing exam_categories table
--
-- Context: exam_categories was created by migration 033 (phase-2, PrepSmart feature)
-- with a different schema (slug, parent_id, level tinyint, icon_emoji, display_order).
-- Migration 089 was silently skipped (CREATE TABLE IF NOT EXISTS).
-- This migration adds all missing columns needed for the AI Library feature.
--
-- Column naming notes:
--   - 'code'       → added as UNIQUE NULL  (existing PrepSmart rows have no code)
--   - 'exam_level' → renamed from 'level'  (existing 'level' tinyint used by PrepSmart)
--   - 'type'       → added as 'exam_type'  (avoids any reserved-word edge cases)
--
-- UP
ALTER TABLE exam_categories
  ADD COLUMN code             VARCHAR(50)  NULL        AFTER name,
  ADD COLUMN exam_type        ENUM('school','engineering','medical',
                                   'civil_services','banking','ssc',
                                   'defence','state_psc','other')
                              NULL                     AFTER code,
  ADD COLUMN exam_level       ENUM('national','state') NULL DEFAULT 'national' AFTER exam_type,
  ADD COLUMN state            VARCHAR(100) NULL        AFTER exam_level,
  ADD COLUMN conducting_body  VARCHAR(200) NULL        AFTER state,
  ADD COLUMN official_website VARCHAR(300) NULL        AFTER conducting_body,
  ADD UNIQUE KEY uq_exam_cat_code (code);

-- Note: code is NULL (not NOT NULL) because 20 existing PrepSmart rows have no code value.
-- MySQL UNIQUE index allows multiple NULLs — new library rows with non-null codes
-- will still be properly unique-constrained and INSERT IGNORE will work correctly.

-- DOWN
-- ALTER TABLE exam_categories
--   DROP KEY uq_exam_cat_code,
--   DROP COLUMN code,
--   DROP COLUMN exam_type,
--   DROP COLUMN exam_level,
--   DROP COLUMN state,
--   DROP COLUMN conducting_body,
--   DROP COLUMN official_website;
