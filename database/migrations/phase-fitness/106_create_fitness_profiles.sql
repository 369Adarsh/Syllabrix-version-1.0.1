-- ============================================================
-- FITNESS MODULE — User Fitness Profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS fitness_profiles (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id               INT UNSIGNED NOT NULL,
  age                   TINYINT UNSIGNED,
  gender                ENUM('male','female','other','prefer_not_to_say') DEFAULT 'prefer_not_to_say',
  height_cm             DECIMAL(5,1),
  weight_kg             DECIMAL(5,1),
  goal                  ENUM('fat_loss','muscle_gain','general_fitness','flexibility','yoga','stamina','recovery') DEFAULT 'general_fitness',
  fitness_level         ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
  activity_level        ENUM('sedentary','lightly_active','moderately_active','very_active','extremely_active') DEFAULT 'sedentary',
  dietary_preference    ENUM('veg','non_veg','vegan','jain','custom') DEFAULT 'non_veg',
  allergies             TEXT,
  medical_notes         TEXT,
  injuries              TEXT,
  available_time_min    TINYINT UNSIGNED DEFAULT 30,
  available_equipment   JSON,
  preferred_styles      JSON,
  sleep_hours           DECIMAL(3,1) DEFAULT 7.0,
  water_intake_goal_ml  INT UNSIGNED DEFAULT 2500,
  target_weight_kg      DECIMAL(5,1),
  target_calories       INT UNSIGNED,
  bmi                   DECIMAL(4,1),
  bmr                   INT UNSIGNED,
  tdee                  INT UNSIGNED,
  onboarding_complete   TINYINT(1) DEFAULT 0,
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_fitness_user (user_id)
);
