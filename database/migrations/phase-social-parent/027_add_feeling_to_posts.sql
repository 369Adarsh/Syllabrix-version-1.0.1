-- Migration 027: Add feeling column to posts table
-- Allows users to share their professional mood/feeling
-- UP
ALTER TABLE posts ADD COLUMN feeling VARCHAR(50) NULL AFTER hashtags;

-- DOWN
-- ALTER TABLE posts DROP COLUMN feeling;
