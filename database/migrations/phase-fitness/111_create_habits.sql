-- ============================================================
-- FITNESS MODULE — Habit Templates, User Habits, and Logs
-- ============================================================
CREATE TABLE IF NOT EXISTS fitness_habit_templates (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  slug            VARCHAR(100) NOT NULL,
  description     TEXT,
  category        ENUM('hydration','sleep','movement','mindfulness','nutrition','challenge') NOT NULL,
  icon            VARCHAR(50),
  color           VARCHAR(20) DEFAULT '#3B82F6',
  default_target  VARCHAR(100),
  unit            VARCHAR(50),
  is_active       TINYINT(1) DEFAULT 1,
  sort_order      TINYINT UNSIGNED DEFAULT 0,
  UNIQUE KEY uq_habit_slug (slug)
);

CREATE TABLE IF NOT EXISTS fitness_user_habits (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL,
  template_id     INT UNSIGNED NOT NULL,
  custom_target   VARCHAR(100),
  current_streak  INT UNSIGNED DEFAULT 0,
  longest_streak  INT UNSIGNED DEFAULT 0,
  total_completed INT UNSIGNED DEFAULT 0,
  is_active       TINYINT(1) DEFAULT 1,
  enrolled_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES fitness_habit_templates(id),
  UNIQUE KEY uq_user_habit (user_id, template_id)
);

CREATE TABLE IF NOT EXISTS fitness_habit_logs (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_habit_id   INT UNSIGNED NOT NULL,
  log_date        DATE NOT NULL,
  value           VARCHAR(100),
  is_completed    TINYINT(1) DEFAULT 1,
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_habit_id) REFERENCES fitness_user_habits(id) ON DELETE CASCADE,
  UNIQUE KEY uq_habit_log_date (user_habit_id, log_date)
);
