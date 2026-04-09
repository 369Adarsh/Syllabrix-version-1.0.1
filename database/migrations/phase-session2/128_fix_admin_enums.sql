-- Migration 128: Fix admin-related ENUMs
-- Adds 'syllabrix_admin' to user_type so registerAdmin can set the correct type.
-- Adds 'finance_manager' and 'analyst' to admin_role ENUM to match application RBAC code.
-- UP

ALTER TABLE users
  MODIFY COLUMN user_type ENUM(
    'student', 'teacher', 'institute', 'parent', 'mentor',
    'professional_learner', 'organization', 'syllabrix_admin'
  ) NOT NULL;

ALTER TABLE users
  MODIFY COLUMN admin_role ENUM(
    'super_admin', 'moderator', 'support', 'finance',
    'finance_manager', 'analyst'
  ) DEFAULT NULL;

-- DOWN
-- ALTER TABLE users MODIFY COLUMN user_type ENUM('student','teacher','institute','parent','mentor','professional_learner','organization') NOT NULL;
-- ALTER TABLE users MODIFY COLUMN admin_role ENUM('super_admin','moderator','support','finance') DEFAULT NULL;
