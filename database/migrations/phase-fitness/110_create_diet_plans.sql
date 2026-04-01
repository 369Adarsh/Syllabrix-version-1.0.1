-- ============================================================
-- FITNESS MODULE — Diet Plans and Meals
-- ============================================================
CREATE TABLE IF NOT EXISTS fitness_diet_plans (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           INT UNSIGNED NOT NULL,
  coach_id          INT UNSIGNED,
  plan_date         DATE NOT NULL,
  plan_type         ENUM('ai_generated','coach_created','custom') DEFAULT 'ai_generated',
  total_calories    INT UNSIGNED DEFAULT 2000,
  protein_g         INT UNSIGNED,
  carbs_g           INT UNSIGNED,
  fats_g            INT UNSIGNED,
  fiber_g           INT UNSIGNED,
  water_ml          INT UNSIGNED DEFAULT 2500,
  notes             TEXT,
  is_followed       TINYINT(1) DEFAULT 0,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_diet_user_date (user_id, plan_date),
  INDEX idx_dp_user (user_id)
);

CREATE TABLE IF NOT EXISTS fitness_diet_meals (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plan_id         INT UNSIGNED NOT NULL,
  meal_type       ENUM('breakfast','morning_snack','lunch','evening_snack','dinner','pre_workout','post_workout') NOT NULL,
  meal_name       VARCHAR(300) NOT NULL,
  description     TEXT,
  calories        INT UNSIGNED,
  protein_g       DECIMAL(5,1),
  carbs_g         DECIMAL(5,1),
  fats_g          DECIMAL(5,1),
  fiber_g         DECIMAL(5,1),
  ingredients     JSON,
  recipe_steps    TEXT,
  prep_time_min   TINYINT UNSIGNED,
  is_veg          TINYINT(1) DEFAULT 1,
  is_consumed     TINYINT(1) DEFAULT 0,
  sort_order      TINYINT UNSIGNED DEFAULT 0,
  FOREIGN KEY (plan_id) REFERENCES fitness_diet_plans(id) ON DELETE CASCADE,
  INDEX idx_dm_plan (plan_id)
);
