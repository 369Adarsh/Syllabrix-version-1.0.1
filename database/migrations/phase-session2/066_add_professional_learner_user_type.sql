-- Migration 066: Add professional_learner to users user_type ENUM
-- UP
ALTER TABLE users
  MODIFY COLUMN user_type ENUM('student','teacher','institute','parent','mentor','professional_learner') NOT NULL;

-- DOWN
-- ALTER TABLE users MODIFY COLUMN user_type ENUM('student','teacher','institute','parent','mentor') NOT NULL;
