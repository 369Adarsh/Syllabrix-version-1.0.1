-- ============================================================
-- FITNESS MODULE — Workout Plans, Days, and Exercises
-- ============================================================
CREATE TABLE IF NOT EXISTS fitness_workout_plans (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL,
  coach_id        INT UNSIGNED,
  title           VARCHAR(300) NOT NULL,
  description     TEXT,
  plan_type       ENUM('ai_generated','coach_created','custom') DEFAULT 'ai_generated',
  difficulty      ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
  goal            ENUM('fat_loss','muscle_gain','general_fitness','flexibility','yoga','stamina','recovery') DEFAULT 'general_fitness',
  duration_weeks  TINYINT UNSIGNED DEFAULT 4,
  days_per_week   TINYINT UNSIGNED DEFAULT 5,
  status          ENUM('active','completed','paused','archived') DEFAULT 'active',
  started_at      DATE,
  completed_at    DATE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_wp_user (user_id),
  INDEX idx_wp_coach (coach_id)
);

CREATE TABLE IF NOT EXISTS fitness_workout_days (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plan_id         INT UNSIGNED NOT NULL,
  day_number      TINYINT UNSIGNED NOT NULL,
  day_name        VARCHAR(50),
  day_type        ENUM('workout','rest','active_recovery','yoga','cardio') DEFAULT 'workout',
  focus           VARCHAR(100),
  est_duration_min TINYINT UNSIGNED DEFAULT 45,
  is_completed    TINYINT(1) DEFAULT 0,
  completed_at    TIMESTAMP NULL,
  notes           TEXT,
  FOREIGN KEY (plan_id) REFERENCES fitness_workout_plans(id) ON DELETE CASCADE,
  INDEX idx_wd_plan (plan_id)
);

CREATE TABLE IF NOT EXISTS fitness_workout_exercises (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  day_id          INT UNSIGNED NOT NULL,
  exercise_id     INT UNSIGNED,
  exercise_name   VARCHAR(200) NOT NULL,
  phase           ENUM('warmup','main','cooldown') DEFAULT 'main',
  sets            TINYINT UNSIGNED DEFAULT 3,
  reps            VARCHAR(50) DEFAULT '12',
  duration_sec    INT UNSIGNED,
  rest_sec        TINYINT UNSIGNED DEFAULT 60,
  weight_kg       DECIMAL(5,1),
  target_muscles  JSON,
  benefits        TEXT,
  precautions     TEXT,
  sort_order      TINYINT UNSIGNED DEFAULT 0,
  is_completed    TINYINT(1) DEFAULT 0,
  FOREIGN KEY (day_id) REFERENCES fitness_workout_days(id) ON DELETE CASCADE,
  INDEX idx_we_day (day_id)
);
